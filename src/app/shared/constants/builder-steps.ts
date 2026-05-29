import { GENERATED_PAGES_CONFIG } from '@shared/configs';
import { PageConfig, BuilderStep } from '@shared/models';
import { BUILDER_DICTIONARY } from './builder-dictionary';

export const STEP_IDS = {
    DESCRIPTION: 'description',
    AGENTS: 'agents',
    RULES: 'rules',
    WORKFLOWS: 'workflows',
    REVIEW: 'review',
} as const;

export const STATE_KEYS = {
    AI_AGENT: 'aiAgent',
    PROJECT_IDENTITY: 'projectIdentity',
    PROJECT_NAME: 'name',
    DOMAINS: 'domains',
    DESCRIPTION: 'description',
    PRESET: 'preset',
} as const;

export const BUILDER_STEPS: BuilderStep[] = [
    {
        id: STEP_IDS.DESCRIPTION,
        label: BUILDER_DICTIONARY.steps.description.label,
        icon: '@tui.folder-code',
        title: BUILDER_DICTIONARY.steps.description.title,
        description: BUILDER_DICTIONARY.steps.description.description,
        highlights: BUILDER_DICTIONARY.steps.description.highlights,
    },
    ...(Object.values(GENERATED_PAGES_CONFIG).sort(
        (a: PageConfig, b: PageConfig) => (a.order ?? 999) - (b.order ?? 999),
    ) as BuilderStep[]),
    {
        id: STEP_IDS.REVIEW,
        label: BUILDER_DICTIONARY.steps.review.label,
        icon: '@tui.file-check',
        title: BUILDER_DICTIONARY.steps.review.title,
        description: BUILDER_DICTIONARY.steps.review.description,
        highlights: BUILDER_DICTIONARY.steps.review.highlights,
    },
];
