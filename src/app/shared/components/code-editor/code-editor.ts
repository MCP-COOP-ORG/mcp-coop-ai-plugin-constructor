import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    input,
    OnDestroy,
    output,
    viewChild,
} from '@angular/core';
import { history, historyKeymap, undo, redo, defaultKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { yaml } from '@codemirror/lang-yaml';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { type CodeLanguage } from '@shared/models';

/**
 * Lightweight CodeMirror 6 wrapper component.
 * Supports markdown, JSON (with built-in validation), and YAML syntax highlighting.
 * Exposes undo() and redo() as public methods for toolbar buttons via viewChild.
 */
@Component({
    selector: 'app-code-editor',
    imports: [],
    templateUrl: './code-editor.html',
    styleUrl: './code-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditor implements OnDestroy {
    // ── Inputs ──────────────────────────────────────────────────────────────
    value = input.required<string>();
    readonly = input<boolean>(true);
    language = input<CodeLanguage>('markdown');

    // ── Outputs ─────────────────────────────────────────────────────────────
    valueChange = output<string>();

    // ── Internal refs ────────────────────────────────────────────────────────
    private readonly editorContainer = viewChild.required<ElementRef<HTMLElement>>('editorContainer');

    private editorView: EditorView | null = null;

    // Compartments allow hot-swapping extensions without rebuilding editor state
    private readonly readonlyCompartment = new Compartment();
    private readonly languageCompartment = new Compartment();

    constructor() {
        // Initialize CM6 after the view has rendered to have access to the DOM
        afterNextRender(() => {
            this.initEditor();
        });

        // Sync external value changes into the editor (e.g., when switching files)
        effect(() => {
            const incoming = this.value();
            if (!this.editorView) return;
            const current = this.editorView.state.doc.toString();
            if (incoming === current) return;
            this.editorView.dispatch({
                changes: { from: 0, to: current.length, insert: incoming },
            });
        });

        // Toggle readonly via Compartment reconfigure (no full rebuild needed)
        effect(() => {
            const isReadonly = this.readonly();
            this.editorView?.dispatch({
                effects: this.readonlyCompartment.reconfigure(EditorState.readOnly.of(isReadonly)),
            });
        });

        // Hot-swap language extension when language input changes
        effect(() => {
            const lang = this.language();
            this.editorView?.dispatch({
                effects: this.languageCompartment.reconfigure(this.getLanguageExtension(lang)),
            });
        });
    }

    ngOnDestroy(): void {
        // Prevent memory leaks — CM6 holds DOM references internally
        this.editorView?.destroy();
        this.editorView = null;
    }

    /** Called by the parent toolbar's Undo button via viewChild */
    undoEdit(): void {
        if (this.editorView) undo(this.editorView);
    }

    /** Called by the parent toolbar's Redo button via viewChild */
    redoEdit(): void {
        if (this.editorView) redo(this.editorView);
    }

    /** Synchronously resets editor content — used by parent on Cancel to bypass Angular scheduling */
    resetContent(content: string): void {
        if (!this.editorView) return;
        const current = this.editorView.state.doc.toString();
        if (content === current) return;
        this.editorView.dispatch({
            changes: { from: 0, to: current.length, insert: content },
        });
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private initEditor(): void {
        const container = this.editorContainer();
        const startState = EditorState.create({
            doc: this.value(),
            extensions: [
                lineNumbers(),
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                this.readonlyCompartment.of(EditorState.readOnly.of(this.readonly())),
                this.languageCompartment.of(this.getLanguageExtension(this.language())),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged && !this.readonly()) {
                        this.valueChange.emit(update.state.doc.toString());
                    }
                }),
                EditorView.theme({
                    '&': {
                        height: '100%',
                        fontSize: '0.8125rem', // Slightly smaller for professional IDE look
                        fontFamily: 'var(--tui-typography-family-text), monospace',
                        background: 'var(--tui-background-base)',
                    },
                    '.cm-scroller': { overflow: 'auto' },
                    '.cm-content': {
                        caretColor: 'var(--tui-text-primary)',
                        padding: 'var(--tui-spacing-4) 0',
                    },
                    '.cm-gutters': {
                        background: 'var(--tui-background-base-alt)',
                        borderRight: '1px solid var(--tui-border-normal)',
                        color: 'var(--tui-text-tertiary)',
                        minWidth: '3.5rem',
                    },
                    '.cm-activeLine': { background: 'var(--tui-background-neutral-1)' },
                    '.cm-activeLineGutter': { background: 'var(--tui-background-neutral-1-hover)' },
                    '.cm-cursor': { borderLeftColor: 'var(--tui-text-primary)' },
                }),
            ],
        });

        this.editorView = new EditorView({
            state: startState,
            parent: container.nativeElement,
        });
    }

    private getLanguageExtension(lang: CodeLanguage) {
        switch (lang) {
            case 'json':
                return json();
            case 'yaml':
                return yaml();
            default:
                return markdown();
        }
    }
}
