import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TuiRoot, provideTaiga } from '@taiga-ui/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SelectField } from './select-field';
import { SelectOption } from '@shared/models';
import { DialogManager, TemplateInterpolator, BuilderState } from '@services';
import { of } from 'rxjs';

// Taiga UI dark-mode token requires matchMedia which jsdom does not provide
beforeAll(() => {
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
            dispatchEvent: () => false,
        }),
    });
});

@Component({
    template: `
        <tui-root>
            <app-select-field
                [label]="label()"
                [placeholder]="placeholder()"
                [options]="options()"
                [formControl]="control"></app-select-field>
        </tui-root>
    `,
    imports: [SelectField, ReactiveFormsModule, TuiRoot],
})
class TestHostComponent {
    label = signal('Test Label');
    placeholder = signal('Test Placeholder');
    options = signal<SelectOption[]>([
        { id: '1', label: 'Option 1' },
        { id: '2', label: 'Option 2' },
    ]);
    control = new FormControl('1');
}

describe('SelectField', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, NoopAnimationsModule],
            providers: [
                provideTaiga(),
                { provide: ChangeDetectorRef, useValue: { markForCheck: vi.fn() } },
                {
                    provide: DialogManager,
                    useValue: { openInfoDialog: vi.fn().mockReturnValue(of({})) },
                },
                {
                    provide: TemplateInterpolator,
                    useValue: { fetchJson: vi.fn() },
                },
                {
                    provide: BuilderState,
                    useValue: { reviewData: signal({}) },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update form control when option is selected', () => {
        component.control.setValue('2');
        fixture.detectChanges();
        expect(component.control.value).toBe('2');
    });

    it('should disable the field when form control is disabled', () => {
        component.control.disable();
        fixture.detectChanges();
        expect(component.control.disabled).toBe(true);
    });

    it('should call onChange and onTouched when onModelChange is triggered', () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        const onChangeSpy = vi.spyOn(selectField as unknown as { onChange: (v: string | null) => void }, 'onChange');
        const onTouchedSpy = vi.spyOn(selectField as unknown as { onTouched: () => void }, 'onTouched');
        selectField.onModelChange('2');
        expect(onChangeSpy).toHaveBeenCalledWith('2');
        expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should have default empty functions for onChange and onTouched that do not throw', () => {
        // Create a new instance to test defaults before they are overwritten by formControl
        const selectField = TestBed.runInInjectionContext(() => {
            // In tests, we need to ensure the constructor can inject ChangeDetectorRef
            return new SelectField();
        });
        expect(() => {
            // Accessing private methods for testing
            (selectField as unknown as { onChange: (v: string | null) => void }).onChange('1');
            (selectField as unknown as { onTouched: () => void }).onTouched();
        }).not.toThrow();
    });

    it('should resolve stringify to label', () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        // Access protected stringify arrow-function property (already bound to instance)
        const stringify = (selectField as unknown as { stringify: (id: string) => string }).stringify;
        expect(stringify('1')).toBe('Option 1');
        expect(stringify('unknown')).toBe('');
    });

    it('should render "No options" when options are empty', async () => {
        component.options.set([]);
        fixture.detectChanges();
        await fixture.whenStable();

        // Trigger dropdown opening
        const select = fixture.nativeElement.querySelector('input[tuiComboBox]');
        (select as HTMLElement)?.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const options = document.querySelectorAll('button[tuiOption]');
        expect(options[0]?.textContent?.trim()).toBe('No options found');
        expect((options[0] as HTMLButtonElement).disabled).toBe(true);
    });

    it('should filter options based on search input', () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;

        // Simulate search
        const event = { target: { value: 'Option 2' } } as unknown as Event;
        selectField.onSearch(event);
        fixture.detectChanges();

        expect(selectField.filteredOptions()).toHaveLength(1);
        expect(selectField.filteredOptions()[0].id).toBe('2');
    });

    it('should reset search when writeValue is called', () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        selectField.search.set('some search');

        selectField.writeValue('2');
        expect(selectField.value).toBe('2');
        expect(selectField.search()).toBe('');
    });

    it('should open info dialog when showInfo is called with description', () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        const dialogManager = TestBed.inject(DialogManager);
        const openInfoSpy = vi.spyOn(dialogManager, 'openInfoDialog');

        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;
        const option = { id: '1', label: 'Option 1', description: 'Test Description' };

        selectField.showInfo(event, option);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(openInfoSpy).toHaveBeenCalledWith('Option 1', 'Test Description');
    });

    it('should fetch and open info dialog when showInfo is called with filePath', async () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        const dialogManager = TestBed.inject(DialogManager);
        const interpolator = TestBed.inject(TemplateInterpolator);

        const openInfoSpy = vi.spyOn(dialogManager, 'openInfoDialog');
        vi.spyOn(interpolator, 'fetchJson').mockResolvedValue({
            description: { default: 'Fetched Content' },
        });

        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;
        const option = { id: '1', label: 'Option 1', filePath: 'some/path.json' };

        selectField.showInfo(event, option);

        // Wait for the microtask (promise)
        await new Promise((r) => setTimeout(r, 0));

        expect(openInfoSpy).toHaveBeenCalledWith('Option 1', 'Fetched Content');
    });

    it('should do nothing if option has no description and no filePath', () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        const dialogManager = TestBed.inject(DialogManager);
        const openInfoSpy = vi.spyOn(dialogManager, 'openInfoDialog');

        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;
        const option = { id: '1', label: 'Option 1' };

        selectField.showInfo(event, option);

        expect(openInfoSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if fetchJson returns null or no description', async () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        const dialogManager = TestBed.inject(DialogManager);
        const interpolator = TestBed.inject(TemplateInterpolator);

        const openInfoSpy = vi.spyOn(dialogManager, 'openInfoDialog');
        vi.spyOn(interpolator, 'fetchJson').mockResolvedValue(null);

        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;
        const option = { id: '1', label: 'Option 1', filePath: 'some/path.json' };

        selectField.showInfo(event, option);
        await new Promise((r) => setTimeout(r, 0));

        expect(openInfoSpy).not.toHaveBeenCalled();
    });

    it('should use agent-specific description if available', async () => {
        const selectField = fixture.debugElement.query(By.directive(SelectField)).componentInstance as SelectField;
        const dialogManager = TestBed.inject(DialogManager);
        const interpolator = TestBed.inject(TemplateInterpolator);
        const builderState = TestBed.inject(BuilderState);

        builderState.reviewData.set({ aiAgent: 'claude' });

        const openInfoSpy = vi.spyOn(dialogManager, 'openInfoDialog');
        vi.spyOn(interpolator, 'fetchJson').mockResolvedValue({
            description: { claude: 'Claude Content', default: 'Default Content' },
        });

        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;
        const option = { id: '1', label: 'Option 1', filePath: 'some/path.json' };

        selectField.showInfo(event, option);
        await new Promise((r) => setTimeout(r, 0));

        expect(openInfoSpy).toHaveBeenCalledWith('Option 1', 'Claude Content');
    });
});
