import { CodeLanguage } from '@shared/models';

export const LANGUAGE_MAP: Record<string, CodeLanguage> = {
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
};

export const DEFAULT_LANGUAGE: CodeLanguage = 'markdown';
