import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { provideTaiga, TuiNotificationService, TuiDialogService } from '@taiga-ui/core';
import { GeneratedFile } from '@shared/models';
import { ArchiveGenerator, BuilderState } from '@services';
import { ReviewStep } from './review-step';
import { CodeEditor } from '@shared/components';
import { buildFileTree } from '@shared/utils';
import { BUILDER_DICTIONARY } from '@shared/constants';
import { of } from 'rxjs';

interface ReviewStepPrivate {
    loadPreview(): Promise<void>;
    archiveGenerator: ArchiveGenerator;
    activeFilePath: { set(v: string | null): void };
    codeEditor(): { undoEdit(): void; redoEdit(): void } | undefined;
}

describe('ReviewStep', () => {
    let component: ReviewStep;
    let fixture: ComponentFixture<ReviewStep>;

    const mockArchiveGenerator = {
        previewFiles: signal<GeneratedFile[]>([]),
        generatePreview: () => Promise.resolve([{ path: 'test.ts', content: 'content', type: 'file' }]),
        downloadArchive: () => undefined,
    };

    const mockNotificationService = {
        open: () => ({ subscribe: () => ({ unsubscribe: () => undefined }) }),
    };

    const mockDialogService = {
        open: vi.fn().mockReturnValue(of(true)),
    };

    beforeEach(async () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: () => undefined,
                removeListener: () => undefined,
                addEventListener: () => undefined,
                removeEventListener: () => undefined,
                dispatchEvent: () => undefined,
            }),
        });

        await TestBed.configureTestingModule({
            imports: [ReviewStep],
            providers: [
                provideTaiga(),
                { provide: ArchiveGenerator, useValue: mockArchiveGenerator },
                { provide: TuiNotificationService, useValue: mockNotificationService },
                { provide: TuiDialogService, useValue: mockDialogService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ReviewStep);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the correct step data bound to the view', () => {
        expect(component.view.step.id).toBe('review');
        expect(component.view.step.title).toBe('Review & Export');
    });

    it('should load files on initialization', async () => {
        await fixture.whenStable();
        expect(component.files().length).toBe(1);
        expect(component.activeFile()?.path).toBe('test.ts');
    });

    it('should change active file on selectNode', async () => {
        await fixture.whenStable();
        component.selectNode({ label: 'other.ts', path: 'other.ts', type: 'file' });
        expect(component.activeFilePath()).toBe('other.ts');
    });

    it('should enable edit mode only if dialog is confirmed', () => {
        // True scenario (from beforeEach mock)
        component.enableEdit();
        expect(component.editMode()).toBe(true);
        expect(component.editContent()).toBe('content');

        component.cancelEdit();
        expect(component.editMode()).toBe(false);

        // False scenario
        const mockDialogs = TestBed.inject(TuiDialogService);
        vi.spyOn(mockDialogs, 'open').mockReturnValueOnce(of(false));
        component.enableEdit();
        expect(component.editMode()).toBe(false); // Should remain false
    });

    it('should update isDirty when content changes', () => {
        component.enableEdit();
        component.onEditorChange('new content');
        expect(component.isDirty()).toBe(true);
        expect(component.editContent()).toBe('new content');
    });

    it('should save edits and persist to builderState', async () => {
        const builderState = TestBed.inject(BuilderState);
        component.enableEdit();
        component.onEditorChange('modified');
        component.saveEdit();

        expect(component.files()[0].content).toBe('modified');
        expect(component.editMode()).toBe(false);
        expect(component.isDirty()).toBe(false);
        // Ensure the manual edit is persisted to the global state
        expect(builderState.editedFiles()['test.ts']).toBe('modified');
    });

    it('should detect language based on extension', async () => {
        await fixture.whenStable();
        component.selectNode({ label: 'test.json', path: 'test.json', type: 'file' });
        expect(component.activeLanguage()).toBe('json');

        component.selectNode({ label: 'test.unknown', path: 'test.unknown', type: 'file' });
        expect(component.activeLanguage()).toBe('markdown');
    });

    it('should build a nested tree structure', () => {
        const files: GeneratedFile[] = [
            { path: 'src', content: '', type: 'folder' },
            { path: 'src/app.ts', content: '...', type: 'file' },
        ];
        const tree = buildFileTree(files, BUILDER_DICTIONARY.review.sidebarTitle);
        expect(tree.children?.length).toBe(1);
        expect(tree.children?.[0].label).toBe('src');
        expect(tree.children?.[0].children?.[0].label).toBe('app.ts');
    });

    it('should handle undo and redo actions', async () => {
        component.activeFilePath.set('test.ts');
        component.enableEdit();
        fixture.detectChanges();
        await fixture.whenStable();

        const editor = (component as unknown as ReviewStepPrivate).codeEditor();
        if (!editor) throw new Error('Editor not found');

        const undoSpy = vi.spyOn(editor, 'undoEdit');
        const redoSpy = vi.spyOn(editor, 'redoEdit');

        component.undoEdit();
        expect(undoSpy).toHaveBeenCalled();

        component.redoEdit();
        expect(redoSpy).toHaveBeenCalled();
    });

    it('should not change active path when selecting a folder', () => {
        const initialPath = component.activeFilePath();
        component.selectNode({ label: 'src', path: 'src', type: 'folder' });
        expect(component.activeFilePath()).toBe(initialPath);
    });

    it('should not save if active path is null', () => {
        const priv = component as unknown as ReviewStepPrivate;
        const spy = vi.spyOn(priv.archiveGenerator.previewFiles, 'set');
        priv.activeFilePath.set(null);
        component.saveEdit();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should handle buildTree with no files', () => {
        const tree = buildFileTree([], BUILDER_DICTIONARY.review.sidebarTitle);
        expect(tree.children?.length).toBe(0);
    });

    it('should handle buildTree with only files in root', () => {
        const files: GeneratedFile[] = [
            { path: 'file1.ts', content: '...', type: 'file' },
            { path: 'file2.ts', content: '...', type: 'file' },
        ];
        const tree = buildFileTree(files, BUILDER_DICTIONARY.review.sidebarTitle);
        expect(tree.children?.length).toBe(2);
        expect(tree.children?.[0].label).toBe('file1.ts');
    });

    it('should handle buildTree with nested folders and files', () => {
        const files: GeneratedFile[] = [
            { path: 'src', content: '', type: 'folder' },
            { path: 'src/app.ts', content: '...', type: 'file' },
        ];
        const tree = buildFileTree(files, BUILDER_DICTIONARY.review.sidebarTitle);
        expect(tree.children?.length).toBe(1);
        expect(tree.children?.[0].label).toBe('src');
        expect(tree.children?.[0].children?.[0].label).toBe('app.ts');
    });

    it('should set isLoading to false after loadPreview', async () => {
        const priv = component as unknown as ReviewStepPrivate;
        await priv.loadPreview();
        expect(component.isLoading()).toBe(false);
    });

    describe('setEnvironment', () => {
        it('should update environment and trigger reload', async () => {
            component.activeEnvironment.set('cursor');
            const priv = component as unknown as ReviewStepPrivate;
            const loadSpy = vi.spyOn(priv, 'loadPreview').mockResolvedValue(undefined);

            component.setEnvironment('claude');

            expect(component.activeEnvironment()).toBe('claude');
            expect(component.isLoading()).toBe(true);
            expect(loadSpy).toHaveBeenCalled();
        });
    });

    it('should handle childrenHandler correctly', () => {
        const nodeWithChildren = {
            type: 'folder' as const,
            path: 'src',
            label: 'src',
            children: [{ type: 'file' as const, path: 'src/app.ts', label: 'app.ts' }],
        };
        const nodeWithoutChildren = { type: 'file' as const, path: 'src/app.ts', label: 'app.ts' };

        expect(component.childrenHandler(nodeWithChildren)).toEqual(nodeWithChildren.children);
        expect(component.childrenHandler(nodeWithoutChildren)).toEqual([]);
    });

    it('should trigger redoEdit from template', async () => {
        component.enableEdit();
        fixture.detectChanges();
        await fixture.whenStable();

        const redoButton = fixture.debugElement.query(By.css('button[title="Redo"]'));
        const redoSpy = vi.spyOn(component, 'redoEdit');
        redoButton.nativeElement.click();
        expect(redoSpy).toHaveBeenCalled();
    });

    it('should trigger setEnvironment from template', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const envButtons = fixture.debugElement.queryAll(By.css('.review-step__editor-env button'));
        const setEnvSpy = vi.spyOn(component, 'setEnvironment');
        envButtons[0].nativeElement.click();
        expect(setEnvSpy).toHaveBeenCalled();
    });

    it('should trigger onEditorChange from code-editor', async () => {
        component.enableEdit();
        fixture.detectChanges();
        await fixture.whenStable();

        const editor = fixture.debugElement.query(By.directive(CodeEditor));
        const onEditorChangeSpy = vi.spyOn(component, 'onEditorChange');
        editor.componentInstance.valueChange.emit('new value');
        expect(onEditorChangeSpy).toHaveBeenCalledWith('new value');
    });

    it('should show empty state when no files are loaded', async () => {
        const priv = component as unknown as ReviewStepPrivate;
        vi.spyOn(priv.archiveGenerator, 'generatePreview').mockResolvedValue([]);

        await priv.loadPreview();
        fixture.detectChanges();

        const emptyState = fixture.debugElement.query(By.css('.review-step__empty'));
        expect(emptyState).toBeTruthy();
        expect(emptyState.nativeElement.textContent).toContain(BUILDER_DICTIONARY.review.emptyState);
    });
});
