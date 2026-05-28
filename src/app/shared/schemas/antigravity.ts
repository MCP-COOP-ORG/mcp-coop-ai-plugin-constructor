import { ArchivePattern } from '@shared/models';
import { GENERATED_PAGE_CATEGORIES, MAIN } from '@shared/configs';

export const ANTIGRAVITY: ArchivePattern[] = [
    {
        type: 'static',
        path: 'GEMINI.md',
        url: MAIN['antigravity'],
    },
    {
        type: 'plugin-manifest',
        path: '.agents/plugins/[plugin]/plugin.json',
    },
    {
        type: 'dynamic-category',
        path: '.agents/plugins/[plugin]/skills/[category]-agent/SKILL.md',
        categories: GENERATED_PAGE_CATEGORIES['agents'],
    },
    {
        type: 'dynamic-category',
        path: '.agents/plugins/[plugin]/rules/[category].md',
        categories: GENERATED_PAGE_CATEGORIES['rules'],
    },
    {
        type: 'dynamic-item',
        path: '.agents/workflows/[item].md',
        categories: GENERATED_PAGE_CATEGORIES['workflows'],
    },
    {
        type: 'dynamic-hook',
        path: '.gemini/settings.json',
        categories: GENERATED_PAGE_CATEGORIES['hooks'],
    },
];
