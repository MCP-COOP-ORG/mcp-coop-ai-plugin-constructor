import { inject, Injectable, signal } from '@angular/core';
import { strToU8, zipSync } from 'fflate';
import { CORE_DIRECTIVES, BUILDER_DICTIONARY } from '@shared/constants';
import { CLAUDE, CURSOR, ANTIGRAVITY } from '@shared/schemas';
import { GENERATED_PLATFORMS_CONFIG, GENERATED_PROJECT_META } from '@shared/configs';
import { ArchivePattern, GeneratedFile } from '@shared/models';
import { BuilderState } from './builder-state';
import { TemplateInterpolator } from './template-interpolator';
import {
    triggerDownload,
    toPluginName,
    ArchiveStrategy,
    StaticFileStrategy,
    DynamicCategoryStrategy,
    DynamicItemStrategy,
    DynamicHookStrategy,
    PluginManifestStrategy,
} from '@shared/utils';

// -----------------------------------------------------------------------------
// Factory & Registry (GoF)
// -----------------------------------------------------------------------------
const SCHEMA_MAP: Record<string, ArchivePattern[]> = {
    claude: CLAUDE,
    cursor: CURSOR,
    antigravity: ANTIGRAVITY,
};

// -----------------------------------------------------------------------------
// Generator Engine
// -----------------------------------------------------------------------------
@Injectable({
    providedIn: 'root',
})
export class ArchiveGenerator {
    private readonly builderState = inject(BuilderState);
    private readonly interpolator = inject(TemplateInterpolator);

    private readonly strategies: Record<string, ArchiveStrategy<ArchivePattern>> = {
        static: new StaticFileStrategy(),
        'dynamic-category': new DynamicCategoryStrategy(),
        'dynamic-item': new DynamicItemStrategy(),
        'dynamic-hook': new DynamicHookStrategy(),
        'plugin-manifest': new PluginManifestStrategy(),
    };

    /** In-memory cache of generated files — populated by generatePreview(), consumed by downloadArchive() */
    readonly previewFiles = signal<GeneratedFile[]>([]);

    async generatePreview(): Promise<GeneratedFile[]> {
        const desc = this.builderState.descriptionData();
        const review = this.builderState.reviewData();

        const agent = review.aiAgent || BUILDER_DICTIONARY.defaults.aiAgent;
        const schema = SCHEMA_MAP[agent] ?? ANTIGRAVITY;
        const platformConfig = GENERATED_PLATFORMS_CONFIG[agent as keyof typeof GENERATED_PLATFORMS_CONFIG];

        let dynamicContext = {};
        Object.keys(this.builderState.dynamicData).forEach((key) => {
            dynamicContext = { ...dynamicContext, ...this.builderState.dynamicData[key]() };
        });

        const projectIdentity = desc.projectIdentity || {};
        const combinedDescription = projectIdentity.description || '';

        let domainText = '';
        const domains = projectIdentity.domains;
        if (Array.isArray(domains)) {
            const domainDescriptions = domains
                .map((dId) => GENERATED_PROJECT_META.find((meta) => meta.id === dId)?.description)
                .filter(Boolean);

            if (domainDescriptions.length > 0) {
                domainText = domainDescriptions.join('\n');
            }
        }

        const projectName = projectIdentity.name || BUILDER_DICTIONARY.common.untitled;

        const pluginName = toPluginName(projectName);

        const context: Record<string, unknown> = {
            ...desc,
            ...projectIdentity,
            description: combinedDescription,
            domains: domainText,
            core_directives: CORE_DIRECTIVES,
            ...dynamicContext,
        };

        const files: GeneratedFile[] = [];

        for (const pattern of schema) {
            // Resolve [plugin] placeholder in pattern paths before passing to strategy
            const resolvedPattern =
                'path' in pattern ? { ...pattern, path: pattern.path.replace(/\[plugin\]/g, pluginName) } : pattern;

            const strategy = this.strategies[resolvedPattern.type];
            if (strategy) {
                const generated = await strategy.generate(
                    resolvedPattern,
                    context,
                    agent,
                    platformConfig,
                    this.interpolator,
                );
                files.push(...generated);
            }
        }

        const edits = this.builderState.editedFiles();

        // Apply any manual edits that the user saved in the ReviewStep
        const finalFiles = files.map((f) => {
            if (f.type === 'file' && edits[f.path]) {
                return { ...f, content: edits[f.path] };
            }
            return f;
        });

        this.previewFiles.set(finalFiles);
        return finalFiles;
    }

    async downloadArchive(files?: GeneratedFile[]): Promise<void> {
        let sourceFiles = files ?? this.previewFiles();
        if (sourceFiles.length === 0) sourceFiles = await this.generatePreview();

        const zipData: Record<string, Uint8Array> = {};
        for (const file of sourceFiles) {
            if (file.type === 'file') zipData[file.path] = strToU8(file.content);
        }

        const zipped = zipSync(zipData);
        const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' });

        // Derive archive name from project name
        const desc = this.builderState.descriptionData();
        const projectIdentity = desc.projectIdentity || {};
        const projectName = projectIdentity.name || BUILDER_DICTIONARY.review.fallbackArchiveName;

        const archiveName =
            projectName
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') + '.zip';

        triggerDownload(blob, archiveName);
    }
}
