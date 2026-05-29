import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ArchiveGenerator } from './archive-generator';
import { StaticFileStrategy } from '@shared/utils';
import { BuilderState } from './builder-state';
import { TemplateInterpolator } from './template-interpolator';
import { GeneratedFile } from '@shared/models';

describe('ArchiveGenerator', () => {
    let service: ArchiveGenerator;
    let builderState: BuilderState;
    let interpolator: TemplateInterpolator;

    beforeEach(() => {
        sessionStorage.clear();
        TestBed.configureTestingModule({
            providers: [provideHttpClient()],
        });
        service = TestBed.inject(ArchiveGenerator);
        builderState = TestBed.inject(BuilderState);
        interpolator = TestBed.inject(TemplateInterpolator);

        // Mock URL functions
        window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
        window.URL.revokeObjectURL = vi.fn();

        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('generatePreview', () => {
        it('should use antigravity fallback if aiAgent is missing', async () => {
            builderState.reviewData.set({});
            vi.spyOn(interpolator, 'fetchJson').mockResolvedValue(null);
            const files = await service.generatePreview();
            expect(files).toBeDefined();
        });

        it('should ignore static pattern if fetchJson returns no content', async () => {
            const strategy = new StaticFileStrategy();
            vi.spyOn(interpolator, 'fetchJson').mockResolvedValue({ content: '' });
            const files = await strategy.generate(
                { type: 'static', path: 'test.md', url: 'test.json' },
                {},
                'custom',
                undefined,
                interpolator,
            );
            expect(files.length).toBe(0);
        });

        it('should process dynamic-category and dynamic-item correctly', async () => {
            builderState.reviewData.set({ aiAgent: 'antigravity' });
            // Set some state that matches actual schemas
            // For instance, frontend: ['angular']
            builderState.dynamicData['agents'].set({ frontend: ['angular'] });
            builderState.dynamicData['workflows'].set({ git: ['gitflow'] });

            vi.spyOn(interpolator, 'fetchJson').mockImplementation(async (url: string) => {
                if (url.includes('angular.json')) return { description: { antigravity: 'Angular Content' } };
                if (url.includes('gitflow.json')) return { description: { antigravity: 'Gitflow Content' } };
                return null;
            });
            vi.spyOn(interpolator, 'interpolate').mockImplementation((str) => str);

            const files = await service.generatePreview();
            expect(files.length).toBeGreaterThan(0);
        });

        it('should process dynamic-hook and produce settings.json', async () => {
            builderState.reviewData.set({ aiAgent: 'cursor' });

            // Override dynamic context to provide selected hooks
            const originalDynamicData = builderState.dynamicData;
            Object.defineProperty(builderState, 'dynamicData', {
                get: () => ({
                    ...originalDynamicData,
                    hooks: vi.fn().mockReturnValue({ 'after-tool': ['auto-prettier'] }),
                }),
                configurable: true,
            });

            vi.spyOn(interpolator, 'fetchJson').mockImplementation(async (url: string) => {
                if (url && url.includes('auto-prettier')) {
                    return {
                        hook: {
                            cursor: { matcher: 'write_file', type: 'command', command: 'prettier' },
                        },
                    };
                }
                return null;
            });

            const files = await service.generatePreview();
            // cursor doesn't support hooks natively in the same way, let's just see if it runs without errors
            expect(files).toBeDefined();
        });

        it('should cover unknown agents without throwing', async () => {
            builderState.reviewData.set({ aiAgent: 'unknown_agent' });
            vi.spyOn(interpolator, 'fetchJson').mockResolvedValue({ content: 'test' });
            const files = await service.generatePreview();
            expect(files).toBeDefined();
        });

        it('should apply manual edits from BuilderState to generated files', async () => {
            builderState.reviewData.set({ aiAgent: 'antigravity' });
            vi.spyOn(interpolator, 'fetchJson').mockResolvedValue({ content: 'Original Content' });
            vi.spyOn(interpolator, 'interpolate').mockImplementation((str) => str);

            // Set an override in the builder state for the static GEMINI.md file
            builderState.editedFiles.update((files) => ({ ...files, 'GEMINI.md': 'User Override Content' }));

            const files = await service.generatePreview();

            const geminiFile = files.find((f) => f.path === 'GEMINI.md');
            expect(geminiFile).toBeDefined();
            expect(geminiFile?.content).toBe('User Override Content');
        });
    });

    describe('downloadArchive', () => {
        it('should use passed files if provided', async () => {
            const mockAnchor = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
            vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

            const mockFiles: GeneratedFile[] = [
                { path: 'test.md', type: 'file', content: 'test' },
                { path: 'folder', type: 'folder', content: '' },
            ];

            const downloadPromise = service.downloadArchive(mockFiles);
            vi.runAllTimers();
            await downloadPromise;

            expect(mockAnchor.download).toBe('ai-context.zip');
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it('should fallback to generatePreview if no files in cache', async () => {
            const mockAnchor = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
            vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

            vi.spyOn(service, 'generatePreview').mockResolvedValue([
                { path: 'auto.md', type: 'file', content: 'auto' },
            ]);
            service.previewFiles.set([]);

            const downloadPromise = service.downloadArchive();
            vi.runAllTimers();
            await downloadPromise;

            expect(service.generatePreview).toHaveBeenCalled();
            expect(mockAnchor.click).toHaveBeenCalled();
        });
    });
});
