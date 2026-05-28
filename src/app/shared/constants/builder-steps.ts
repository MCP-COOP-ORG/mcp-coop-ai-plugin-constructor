import { GENERATED_PAGES_CONFIG } from '@shared/configs';
import { PageConfig } from '@shared/models';

export const STEP_IDS = {
    DESCRIPTION: 'description',
    AGENTS: 'agents',
    RULES: 'rules',
    WORKFLOWS: 'workflows',
    REVIEW: 'review',
} as const;

export type FieldLayout = 'full' | 'half' | 'third';
export type FieldType = 'radio' | 'checkbox' | 'textarea' | 'input' | 'multi-select' | 'composite' | 'select';

export interface BuilderFieldConfig {
    id: string;
    type: FieldType;
    label?: string;
    placeholder?: string;
    options?: { id: string; label: string }[];
    layout?: FieldLayout;
    validators?: string[];
    maxLength?: number;
}

export interface BuilderBlockConfig {
    id: string;
    title: string;
    icon: string;
    type: FieldType;
    options?: { id: string; label: string }[];
    defaultOptionId?: string;
    label?: string;
    placeholder?: string;
    fields?: BuilderFieldConfig[];
    events?: Record<string, string>;
    description?: string;
    default?: boolean;
}

export interface BuilderStep {
    id: string;
    label: string;
    icon: string;
    title: string;
    description: string;
    highlights?: string[];
}

export const BUILDER_STEPS: BuilderStep[] = [
    {
        id: STEP_IDS.DESCRIPTION,
        label: 'Plugin',
        icon: '@tui.folder-code',
        title: 'Plugin Configuration',
        description:
            'Define the core business logic, primary goals, and domain constraints of your project.\nThis provides the AI with deep contextual understanding to avoid generic assumptions.\n\nInjected into the root configuration files:\ne.g., CLAUDE.md, GEMINI.md, AGENTS.md, etc.',
        highlights: [
            'core business logic',
            'domain constraints',
            'deep contextual understanding',
            'avoid generic assumptions',
            'CLAUDE.md',
            'GEMINI.md',
            'AGENTS.md',
        ],
    },
    ...(Object.values(GENERATED_PAGES_CONFIG).sort(
        (a: PageConfig, b: PageConfig) => (a.order ?? 999) - (b.order ?? 999),
    ) as BuilderStep[]),
    {
        id: STEP_IDS.REVIEW,
        label: 'Review',
        icon: '@tui.file-check',
        title: 'Review & Export',
        description:
            'Review the generated configuration files (Markdown rules/skills and JSON settings) for your agent environment.\nYou can make manual tweaks to the code before downloading the final bundle.\n\nExports as a standalone bundle:\ne.g., my-project.zip',
        highlights: ['Markdown rules/skills', 'JSON settings', 'manual tweaks', 'my-project.zip'],
    },
];
