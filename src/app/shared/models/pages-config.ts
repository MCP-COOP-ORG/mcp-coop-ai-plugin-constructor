export interface MetaInformation {
    id: string;
    label: string;
    description: string;
}

export interface ConfigItem {
    id: string;
    label: string;
    filePath: string;
    recommendedWith?: string[];
    discouragedWith?: string[];
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
