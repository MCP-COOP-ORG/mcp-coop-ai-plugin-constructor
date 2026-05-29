import { STATE_KEYS } from './builder-steps';
import { BuilderBlockConfig } from '@shared/models';
import { BUILDER_DICTIONARY } from './builder-dictionary';
import { GENERATED_PROJECT_META } from '@shared/configs';

export const DESCRIPTION_BLOCKS: BuilderBlockConfig[] = [
    {
        id: STATE_KEYS.PROJECT_IDENTITY,
        title: BUILDER_DICTIONARY.labels.pluginIdentity,
        icon: '@tui.folder-code',
        type: 'composite',
        fields: [
            {
                id: STATE_KEYS.PROJECT_NAME,
                type: 'input',
                label: BUILDER_DICTIONARY.labels.projectName,
                placeholder: BUILDER_DICTIONARY.placeholders.projectName,
                layout: 'half',
                validators: ['required', 'minLength:3', 'maxLength:100'],
                maxLength: 100,
            },
            {
                id: STATE_KEYS.PRESET,
                type: 'select',
                label: BUILDER_DICTIONARY.presets.label,
                placeholder: BUILDER_DICTIONARY.presets.placeholder,
                layout: 'half',
                options: [], // dynamically populated
            },
            {
                id: STATE_KEYS.DOMAINS,
                type: 'multi-select',
                label: BUILDER_DICTIONARY.labels.businessDomains,
                placeholder: BUILDER_DICTIONARY.placeholders.businessDomains,
                layout: 'full',
                options: GENERATED_PROJECT_META.map((meta) => ({
                    id: meta.id,
                    label: meta.label,
                    description: meta.description,
                })),
            },
            {
                id: STATE_KEYS.DESCRIPTION,
                type: 'textarea',
                label: BUILDER_DICTIONARY.labels.projectIdentity,
                placeholder: BUILDER_DICTIONARY.placeholders.projectIdentity,
                layout: 'full',
            },
        ],
    },
];
