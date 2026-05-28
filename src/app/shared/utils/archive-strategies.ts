import { forkJoin, from, lastValueFrom, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeneratedFile } from '@shared/constants';
import { ASSET_FILE_PATHS, GENERATED_PAGES_CONFIG, MAIN } from '@shared/configs';
import {
    ArchivePattern,
    StaticFilePattern,
    DynamicCategoryPattern,
    DynamicItemPattern,
    DynamicHookPattern,
    PluginManifestPattern,
    PlatformConfig,
} from '@shared/models';
import { TemplateInterpolator } from '@services';

export function getWrapperType(category: string): string {
    for (const page of Object.values(GENERATED_PAGES_CONFIG)) {
        if (page.categories.some((c) => c.id === category)) {
            return page.wrapperType ?? page.id;
        }
    }
    return 'workflow';
}

/**
 * Derives a plugin directory name from the project name.
 * "My Cool Project" → "my-cool-project-plugin"
 */
export function toPluginName(projectName: string): string {
    return (
        projectName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-plugin'
    );
}

interface SnippetData {
    description?: Record<string, string>;
    hook?: Record<string, { matcher: string; type: string; command: string }>;
}

export async function fetchItemsConcurrently(items: string[], interpolator: TemplateInterpolator) {
    if (!items || items.length === 0) return [];

    const observables = items.map((item) => {
        const url = ASSET_FILE_PATHS[item as keyof typeof ASSET_FILE_PATHS];
        if (!url) return of({ item, snippet: null });

        return from(interpolator.fetchJson<SnippetData>(url)).pipe(map((snippet) => ({ item, snippet })));
    });

    return lastValueFrom(forkJoin(observables));
}

export interface ArchiveStrategy<T extends ArchivePattern> {
    generate(
        pattern: T,
        context: Record<string, unknown>,
        agent: string,
        platformConfig: PlatformConfig | undefined,
        interpolator: TemplateInterpolator,
    ): Promise<GeneratedFile[]>;
}

export class StaticFileStrategy implements ArchiveStrategy<StaticFilePattern> {
    async generate(
        pattern: StaticFilePattern,
        context: Record<string, unknown>,
        agent: string,
        platformConfig: PlatformConfig | undefined,
        interpolator: TemplateInterpolator,
    ): Promise<GeneratedFile[]> {
        if (platformConfig && pattern.url === MAIN[agent as keyof typeof MAIN]) {
            const content = interpolator.interpolate(platformConfig.content, context);
            return [{ path: pattern.path, type: 'file', content }];
        } else {
            const json = await interpolator.fetchJson<{ content: string }>(pattern.url!);
            if (json?.content) {
                const content = interpolator.interpolate(json.content, context);
                return [{ path: pattern.path, type: 'file', content }];
            }
        }
        return [];
    }
}

export class DynamicCategoryStrategy implements ArchiveStrategy<DynamicCategoryPattern> {
    async generate(
        pattern: DynamicCategoryPattern,
        context: Record<string, unknown>,
        agent: string,
        platformConfig: PlatformConfig | undefined,
        interpolator: TemplateInterpolator,
    ): Promise<GeneratedFile[]> {
        const files: GeneratedFile[] = [];

        for (const cat of pattern.categories!) {
            const selectedItems = context[cat] as string[];
            if (!selectedItems || selectedItems.length === 0) continue;

            const itemsData = await fetchItemsConcurrently(selectedItems, interpolator);

            let combinedContent = '';
            for (const data of itemsData) {
                const itemContent = data.snippet?.description?.[agent] ?? data.snippet?.description?.['default'];
                if (itemContent) combinedContent += itemContent + '\n\n';
            }

            if (combinedContent) {
                const wrapperType = getWrapperType(cat);
                const wrapperString = platformConfig?.templates?.[
                    wrapperType as keyof typeof platformConfig.templates
                ] as string | undefined;

                if (wrapperString) {
                    const defaults = platformConfig?.defaults;
                    const defaultDesc =
                        wrapperType === 'skill'
                            ? (defaults?.skillDescription ?? '')
                            : (defaults?.ruleDescription ?? '');

                    const finalContent = interpolator.interpolate(wrapperString, {
                        name: cat.charAt(0).toUpperCase() + cat.slice(1),
                        trigger: defaults?.trigger ?? '',
                        description: defaultDesc.replace('{{category}}', cat),
                        ...(defaults?.globs ? { globs: defaults.globs } : {}),
                        content: combinedContent.trim(),
                    });
                    files.push({ path: pattern.path.replace('[category]', cat), type: 'file', content: finalContent });
                }
            }
        }
        return files;
    }
}

export class DynamicItemStrategy implements ArchiveStrategy<DynamicItemPattern> {
    async generate(
        pattern: DynamicItemPattern,
        context: Record<string, unknown>,
        agent: string,
        platformConfig: PlatformConfig | undefined,
        interpolator: TemplateInterpolator,
    ): Promise<GeneratedFile[]> {
        const files: GeneratedFile[] = [];

        for (const cat of pattern.categories!) {
            const selectedItems = context[cat] as string[];
            if (!selectedItems || selectedItems.length === 0) continue;

            const itemsData = await fetchItemsConcurrently(selectedItems, interpolator);

            for (const data of itemsData) {
                const itemContent = data.snippet?.description?.[agent] ?? data.snippet?.description?.['default'];

                if (itemContent) {
                    const wrapperType = getWrapperType(cat);
                    const wrapperString = platformConfig?.templates?.[
                        wrapperType as keyof typeof platformConfig.templates
                    ] as string | undefined;

                    if (wrapperString) {
                        const defaults = platformConfig?.defaults;
                        const finalContent = interpolator.interpolate(wrapperString, {
                            name: data.item.charAt(0).toUpperCase() + data.item.slice(1),
                            trigger: defaults?.trigger ?? '',
                            description: (defaults?.workflowDescription ?? '').replace('{{item}}', data.item),
                            ...(defaults?.globs ? { globs: defaults.globs } : {}),
                            content: itemContent.trim(),
                        });
                        files.push({
                            path: pattern.path.replace('[item]', data.item),
                            type: 'file',
                            content: finalContent,
                        });
                    }
                }
            }
        }
        return files;
    }
}

export class DynamicHookStrategy implements ArchiveStrategy<DynamicHookPattern> {
    async generate(
        pattern: DynamicHookPattern,
        context: Record<string, unknown>,
        agent: string,
        _platformConfig: PlatformConfig | undefined,
        interpolator: TemplateInterpolator,
    ): Promise<GeneratedFile[]> {
        const hooksPage = GENERATED_PAGES_CONFIG['hooks'];
        if (!hooksPage) return [];

        const hookEntries: Record<string, { matcher: string; hooks: { type: string; command: string }[] }[]> = {};

        for (const catId of pattern.categories) {
            const selectedItems = context[catId] as string[];
            if (!selectedItems || selectedItems.length === 0) continue;

            const category = hooksPage.categories.find((c) => c.id === catId);
            const platformEventName = category?.events?.[agent];
            if (!platformEventName) continue;

            const itemsData = await fetchItemsConcurrently(selectedItems, interpolator);

            for (const data of itemsData) {
                const hookData = data.snippet?.hook?.[agent];
                if (!hookData) continue;

                if (!hookEntries[platformEventName]) {
                    hookEntries[platformEventName] = [];
                }

                hookEntries[platformEventName].push({
                    matcher: hookData.matcher,
                    hooks: [{ type: hookData.type, command: hookData.command }],
                });
            }
        }

        if (Object.keys(hookEntries).length === 0) return [];

        const settingsJson = JSON.stringify({ hooks: hookEntries }, undefined, 2);
        return [{ path: pattern.path, type: 'file', content: settingsJson }];
    }
}

export class PluginManifestStrategy implements ArchiveStrategy<PluginManifestPattern> {
    async generate(pattern: PluginManifestPattern, context: Record<string, unknown>): Promise<GeneratedFile[]> {
        const projectName = (context['name'] as string) || 'untitled';
        const pluginName = toPluginName(projectName);
        const description = (context['description'] as string) || '';

        const manifest = {
            name: pluginName,
            description,
            version: '1.0.0',
            author: { name: 'MCP COOP AI Plugin Constructor' },
        };

        // pattern.path is already resolved by ArchiveGenerator (no [plugin] placeholder)
        return [{ path: pattern.path, type: 'file', content: JSON.stringify(manifest, undefined, 2) }];
    }
}
