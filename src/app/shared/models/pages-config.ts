export interface MetaInformation {
    id: string;
    label: string;
    description: string;
    visibility?: boolean;
}

export interface ConfigItem {
    id: string;
    label: string;
    filePath: string;
    recommendedWith?: string[];
    discouragedWith?: string[];
    visibility?: boolean;
}

export interface ConfigCategory {
    id: string;
    title: string;
    icon: string;
    type: 'checkbox' | 'radio';
    order?: number;
    description?: string;
    events?: Record<string, string>;
    default?: boolean;
    commonInfo?: string;
    visibility?: boolean;
    items: ConfigItem[];
}

export interface PageConfig {
    id: string;
    label: string;
    icon: string;
    title: string;
    description: string;
    highlights?: string[];
    order?: number;
    wrapperType?: string;
    categories: ConfigCategory[];
}
