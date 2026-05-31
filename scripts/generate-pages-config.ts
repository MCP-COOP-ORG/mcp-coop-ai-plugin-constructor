import * as fs from 'fs';
import * as path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const PAGES_DIR = path.join(ASSETS_DIR, 'pages');
const PLATFORMS_DIR = path.join(ASSETS_DIR, 'platforms');
const OUTPUT_FILE = path.join(process.cwd(), 'src/app/shared/configs/generated-pages-config.ts');

function toTitleCase(str: string): string {
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function generate() {
    const pagesConfig: Record<string, unknown> = {};
    const platformConfig: Record<string, unknown> = {};
    const assetFilePaths: Record<string, string> = {};

    // 1. Generate Pages Config
    const pages = fs.readdirSync(PAGES_DIR, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());

    pages.forEach((pageDirent) => {
        const pageId = pageDirent.name;
        const pagePath = path.join(PAGES_DIR, pageId);
        const pageMetaPath = path.join(pagePath, '_meta.json');

        if (!fs.existsSync(pageMetaPath)) {
            console.warn(`Missing _meta.json for page: ${pageId}`);
            return;
        }

        const pageMeta = JSON.parse(fs.readFileSync(pageMetaPath, 'utf8'));
        const categories: Record<string, unknown>[] = [];

        const categoryDirents = fs
            .readdirSync(pagePath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory());

        categoryDirents.forEach((catDirent) => {
            const catId = catDirent.name;
            const catPath = path.join(pagePath, catId);
            const catMetaPath = path.join(catPath, '_meta.json');

            if (!fs.existsSync(catMetaPath)) {
                console.warn(`Missing _meta.json for category: ${pageId}/${catId}`);
                return;
            }

            const catMeta = JSON.parse(fs.readFileSync(catMetaPath, 'utf8'));
            const items: Record<string, unknown>[] = [];

            const itemFiles = fs.readdirSync(catPath).filter((file) => file.endsWith('.json') && file !== '_meta.json');

            itemFiles.forEach((file) => {
                const itemId = path.parse(file).name;
                const label = toTitleCase(itemId);
                const filePath = `assets/pages/${pageId}/${catId}/${file}`;
                const itemJson = JSON.parse(fs.readFileSync(path.join(catPath, file), 'utf8'));

                items.push({
                    id: itemId,
                    label: label,
                    filePath: filePath,
                    ...(itemJson.recommendedWith?.length ? { recommendedWith: itemJson.recommendedWith } : {}),
                    ...(itemJson.discouragedWith?.length ? { discouragedWith: itemJson.discouragedWith } : {}),
                    ...(itemJson.visibility !== undefined ? { visibility: itemJson.visibility } : {}),
                });

                assetFilePaths[itemId] = filePath;
            });

            if (items.length === 0) return;

            categories.push({
                id: catId,
                ...catMeta,
                ...(catMeta.events ? { events: catMeta.events } : {}),
                ...(catMeta.default ? { default: catMeta.default } : {}),
                items: items,
            });
        });

        categories.sort((a, b) => ((a['order'] as number) ?? 999) - ((b['order'] as number) ?? 999));

        pagesConfig[pageId] = {
            id: pageId,
            ...pageMeta,
            ...(pageMeta.wrapperType ? { wrapperType: pageMeta.wrapperType } : {}),
            categories: categories,
        };
    });

    // Build page categories map: { agents: ['frontend', 'backend', ...], hooks: ['session-start', ...] }
    const pageCategoriesMap: Record<string, string[]> = {};
    Object.entries(pagesConfig).forEach(([pageId, page]) => {
        const typedPage = page as { categories?: { id: string }[] };
        pageCategoriesMap[pageId] = (typedPage.categories || []).map((c) => c.id);
    });

    // 2. Generate Platforms Config & Legacy Mapping
    const mainMapping: Record<string, string> = {};
    const templatesMapping: Record<string, string> = {};

    if (fs.existsSync(PLATFORMS_DIR)) {
        const platformFiles = fs.readdirSync(PLATFORMS_DIR).filter((file) => file.endsWith('.json'));

        platformFiles.forEach((file) => {
            const platformId = path.parse(file).name;
            const config = JSON.parse(fs.readFileSync(path.join(PLATFORMS_DIR, file), 'utf8'));
            // Ensure it has 'content' field (if it has 'main', map it)
            if (config.main && !config.content) config.content = config.main;
            platformConfig[platformId] = config;

            const filePath = `assets/platforms/${file}`;
            mainMapping[platformId] = filePath;

            // For legacy TEMPLATES support, we point all wrapper types to the agent's file.
            // NOTE: ArchiveGenerator will need to be updated to handle this correctly.
            templatesMapping['skill'] = filePath; // This is problematic as it's not agent-specific here
            templatesMapping['rule'] = filePath;
            templatesMapping['workflow'] = filePath;
        });
    }

    // Build AI environments from platform configs
    const aiEnvironments = Object.values(platformConfig).map((p) => {
        const typedP = p as { id: string; label?: string };
        return { id: typedP.id, label: typedP.label || typedP.id };
    });

    const presetsDir = path.join(PAGES_DIR, 'description/presets');
    const presets: Record<string, unknown>[] = [];
    if (fs.existsSync(presetsDir)) {
        const presetFiles = fs.readdirSync(presetsDir).filter((f) => f.endsWith('.json'));
        for (const file of presetFiles) {
            const presetData = JSON.parse(fs.readFileSync(path.join(presetsDir, file), 'utf8'));
            if (presetData.visibility === true) {
                presetData.id = file.replace('.json', '');
                presets.push(presetData);
            }
        }
    }

    const metaDir = path.join(PAGES_DIR, 'description/project-meta-information');
    const projectMeta: Record<string, unknown>[] = [];
    if (fs.existsSync(metaDir)) {
        const metaFiles = fs.readdirSync(metaDir).filter((f) => f.endsWith('.json'));
        for (const file of metaFiles) {
            const metaData = JSON.parse(fs.readFileSync(path.join(metaDir, file), 'utf8'));
            if (metaData.visibility === true) {
                metaData.id = file.replace('.json', '');
                projectMeta.push(metaData);
            }
        }
    }

    const content = `/**
 * GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated by scripts/generate-pages-config.ts
 */

import { PageConfig, PlatformConfig, Preset, MetaInformation } from '@shared/models';

export const GENERATED_PAGES_CONFIG: Record<string, PageConfig> = ${JSON.stringify(pagesConfig, null, 2)};

export const GENERATED_PLATFORMS_CONFIG: Record<string, PlatformConfig> = ${JSON.stringify(platformConfig, null, 2)};

export const GENERATED_PAGE_CATEGORIES: Record<string, string[]> = ${JSON.stringify(pageCategoriesMap, null, 2)};

export const GENERATED_AI_ENVIRONMENTS: { id: string; label: string }[] = ${JSON.stringify(aiEnvironments, null, 2)};

export const ASSET_FILE_PATHS: Record<string, string> = ${JSON.stringify(assetFilePaths, null, 2)};

export const MAIN: Record<string, string> = ${JSON.stringify(mainMapping, null, 2)};

export const TEMPLATES: Record<string, string> = ${JSON.stringify(templatesMapping, null, 2)};

export const GENERATED_PRESETS: Preset[] = ${JSON.stringify(presets, null, 2)};

export const GENERATED_PROJECT_META: MetaInformation[] = ${JSON.stringify(projectMeta, null, 2)};
`;

    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`Successfully generated: ${OUTPUT_FILE}`);
}

generate();
