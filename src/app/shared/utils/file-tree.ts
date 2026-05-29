import { GeneratedFile, FileTreeNode } from '@shared/models';

/**
 * Converts a flat GeneratedFile[] into a nested FileTreeNode hierarchy.
 * Auto-vivifies folder nodes based on file paths.
 */
export function buildFileTree(files: GeneratedFile[], rootLabel: string): FileTreeNode {
    const rootChildren: FileTreeNode[] = [];

    const getOrCreateFolder = (pathSegments: string[]): FileTreeNode[] => {
        let currentLevel = rootChildren;
        let currentPath = '';

        for (const segment of pathSegments) {
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;

            let node = currentLevel.find((n) => n.label === segment && n.type === 'folder');
            if (!node) {
                node = { label: segment, path: currentPath, type: 'folder', children: [] };
                currentLevel.push(node);
            }
            currentLevel = node.children!;
        }
        return currentLevel;
    };

    for (const entry of files) {
        if (entry.type !== 'file') continue;

        const segments = entry.path.split('/');
        const fileName = segments.pop()!;

        const fileNode: FileTreeNode = {
            label: fileName,
            path: entry.path,
            type: 'file',
        };

        if (segments.length > 0) {
            const parentChildren = getOrCreateFolder(segments);
            parentChildren.push(fileNode);
        } else {
            rootChildren.push(fileNode);
        }
    }

    return {
        label: rootLabel,
        path: '',
        type: 'folder',
        children: rootChildren,
    };
}
