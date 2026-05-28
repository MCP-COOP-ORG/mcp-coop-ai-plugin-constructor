import { ArchivePattern } from '@shared/models';
import { GENERATED_PAGE_CATEGORIES, MAIN } from '@shared/configs';

export const CLAUDE: ArchivePattern[] = [
    {
        type: 'static',
        path: 'CLAUDE.md',
        url: MAIN['claude'],
    },
    {
        type: 'plugin-manifest',
        path: '[plugin]/.claude-plugin/plugin.json',
    },
    {
        // Agent skills inside the plugin directory
        type: 'dynamic-category',
        path: '[plugin]/skills/[category]-agent/SKILL.md',
        categories: GENERATED_PAGE_CATEGORIES['agents'],
    },
    {
        // Rules + Workflows at workspace level (.claude/rules/) — Claude does NOT support rules inside plugins
        type: 'dynamic-category',
        path: '.claude/rules/[category].md',
        categories: Array.from(
            new Set([...(GENERATED_PAGE_CATEGORIES['rules'] ?? []), ...(GENERATED_PAGE_CATEGORIES['workflows'] ?? [])]),
        ),
    },
    {
        type: 'dynamic-hook',
        path: '.claude/settings.json',
        categories: GENERATED_PAGE_CATEGORIES['hooks'],
    },
];
