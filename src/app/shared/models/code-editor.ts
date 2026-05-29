export type CodeLanguage = 'markdown' | 'json' | 'yaml';

export interface GeneratedFile {
    readonly path: string;
    readonly type: 'file' | 'folder';
    readonly content: string;
}

export interface FileTreeNode {
    readonly label: string;
    readonly path: string;
    readonly type: 'file' | 'folder';
    readonly children?: FileTreeNode[];
}
