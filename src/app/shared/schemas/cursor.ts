import { ArchivePattern } from '@shared/models';
import { GENERATED_PAGE_CATEGORIES, MAIN } from '@shared/configs';

export const CURSOR: ArchivePattern[] = [
    {
        type: 'static',
        path: 'AGENTS.md',
        url: MAIN['cursor'],
    },
    {
        type: 'plugin-manifest',
        path: '[plugin]/.cursor-plugin/plugin.json',
    },
    {
        type: 'dynamic-category',
        path: '[plugin]/skills/[category]-agent/SKILL.md',
        categories: [...(GENERATED_PAGE_CATEGORIES['agents'] ?? [])],
    },
    {
        // Rules + Workflows inside plugin with .mdc extension — Cursor supports rules in plugins
        type: 'dynamic-category',
        path: '[plugin]/rules/[category].mdc',
        categories: Array.from(
            new Set([...(GENERATED_PAGE_CATEGORIES['rules'] ?? []), ...(GENERATED_PAGE_CATEGORIES['workflows'] ?? [])]),
        ),
    },
    {
        type: 'dynamic-hook',
        path: '.cursor/hooks.json',
        categories: [...(GENERATED_PAGE_CATEGORIES['hooks'] ?? [])],
    },
];
