export interface HookConfig {
    readonly matcher: string;
    readonly type: string;
    readonly command: string;
}

export interface SnippetData {
    readonly description?: Record<string, string>;
    readonly hook?: Record<string, HookConfig>;
}

export interface HookAction {
    readonly type: string;
    readonly command: string;
}

export interface HookEventEntry {
    readonly matcher: string;
    readonly hooks: HookAction[];
}

export type HookEntriesRegistry = Record<string, HookEventEntry[]>;
