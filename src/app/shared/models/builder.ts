import { SelectOption } from './select-option';

export type FieldLayout = 'full' | 'half' | 'third';
export type FieldType = 'radio' | 'checkbox' | 'textarea' | 'input' | 'multi-select' | 'composite' | 'select';

export interface BuilderFieldConfig {
    readonly id: string;
    readonly type: FieldType;
    readonly label?: string;
    readonly placeholder?: string;
    readonly options?: SelectOption[];
    readonly layout?: FieldLayout;
    readonly validators?: string[];
    readonly maxLength?: number;
}

export interface BuilderBlockConfig {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly type: FieldType;
    readonly options?: SelectOption[];
    readonly defaultOptionId?: string;
    readonly label?: string;
    readonly placeholder?: string;
    readonly fields?: BuilderFieldConfig[];
    readonly events?: Record<string, string>;
    readonly description?: string;
    readonly default?: boolean;
}

export interface BuilderStep {
    readonly id: string;
    readonly label: string;
    readonly icon: string;
    readonly title: string;
    readonly description: string;
    readonly highlights?: readonly string[];
}

export interface FormStepView {
    readonly blocksArray: BuilderBlockConfig[];
    readonly [key: string]: unknown;
}
