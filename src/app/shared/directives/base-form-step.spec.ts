import { Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { BaseFormStep } from './base-form-step';
import { BuilderState } from '@services';
import { FormStepView } from '@shared/models';
import { BUILDER_DICTIONARY } from '@shared/constants';

@Component({
    selector: 'app-mock-form-step',
    template: '',
    imports: [ReactiveFormsModule],
})
class MockFormStepComponent extends BaseFormStep {
    view: FormStepView = {
        id: 'test-step',
        label: 'Test Step',
        icon: 'test-icon',
        title: 'Test Step Title',
        description: 'Test step description',
        blocksArray: [
            {
                id: 'comp1',
                title: 'Composite 1',
                icon: 'i1',
                type: 'composite',
                fields: [
                    {
                        id: 'f1',
                        type: 'input',
                        label: 'Field 1',
                        validators: ['required', 'minLength:3', 'maxLength:10'],
                    },
                    { id: 'f2', type: 'checkbox', label: 'Field 2' },
                    { id: 'f3', type: 'select', label: 'Field 3' },
                ],
            },
            {
                id: 'txt1',
                title: 'Textarea 1',
                icon: 'i2',
                type: 'textarea',
            },
            {
                id: 'chk1',
                title: 'Checkbox 1',
                icon: 'i3',
                type: 'checkbox',
                default: true,
                options: [
                    { id: 'opt1', label: 'Option 1' },
                    { id: 'opt2', label: 'Option 2' },
                ],
            },
        ],
    };

    private readonly localState = signal<Record<string, unknown>>({});

    override get stateSignal(): WritableSignal<Record<string, unknown>> {
        return this.localState;
    }
}

describe('BaseFormStep', () => {
    let component: MockFormStepComponent;
    let fixture: ComponentFixture<MockFormStepComponent>;
    let builderState: BuilderState;

    beforeEach(async () => {
        sessionStorage.clear();
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MockFormStepComponent],
            providers: [BuilderState],
        }).compileComponents();

        builderState = TestBed.inject(BuilderState);
        fixture = TestBed.createComponent(MockFormStepComponent);
        component = fixture.componentInstance;
    });

    it('should create and initialize the form structure with default values', () => {
        fixture.detectChanges();

        expect(component.form).toBeDefined();
        expect(component.form.get('comp1')).toBeInstanceOf(FormGroup);
        expect(component.form.get('txt1')).toBeDefined();
        expect(component.form.get('chk1')).toBeDefined();

        // Check default values for composite fields
        const compGroup = component.form.get('comp1') as FormGroup;
        expect(compGroup.get('f1')?.value).toBe('');
        expect(compGroup.get('f2')?.value).toEqual([]);
        expect(compGroup.get('f3')?.value).toBeNull();

        // Check default values for non-composite fields
        expect(component.form.get('txt1')?.value).toBe('');
        expect(component.form.get('chk1')?.value).toEqual(['opt1', 'opt2']);
    });

    it('should initialize stateSignal with form defaults if initially empty', () => {
        expect(Object.keys(component.stateSignal()).length).toBe(0);

        fixture.detectChanges();

        const formValue = component.form.getRawValue();
        expect(component.stateSignal()).toEqual(formValue);
    });

    it('should initialize form with stateSignal value if initially populated', () => {
        component.stateSignal.set({
            comp1: { f1: 'Custom Value', f2: ['opt2'], f3: '1' },
            txt1: 'Custom Text',
            chk1: ['opt1'],
        });

        fixture.detectChanges();

        expect(component.form.get('comp1.f1')?.value).toBe('Custom Value');
        expect(component.form.get('comp1.f2')?.value).toEqual(['opt2']);
        expect(component.form.get('comp1.f3')?.value).toBe('1');
        expect(component.form.get('txt1')?.value).toBe('Custom Text');
        expect(component.form.get('chk1')?.value).toEqual(['opt1']);
    });

    it('should update builderState.isStepValid on form status changes', () => {
        fixture.detectChanges();

        // Initial form should be invalid because 'f1' has the 'required' validator
        expect(component.form.valid).toBe(false);
        expect(builderState.isStepValid()).toBe(false);

        // Fill f1 with valid data
        component.form.patchValue({
            comp1: { f1: 'Valid Data' },
        });

        expect(component.form.valid).toBe(true);
        expect(builderState.isStepValid()).toBe(true);
    });

    it('should debounce and save value changes to stateSignal', async () => {
        fixture.detectChanges();

        // Initial state is saved
        const initialFormVal = component.form.getRawValue();
        expect(component.stateSignal()).toEqual(initialFormVal);

        // Change values in form
        component.form.patchValue({
            txt1: 'Debounced change',
        });

        // Value shouldn't be propagated immediately due to debounceTime
        expect(component.stateSignal()['txt1']).toBe('');

        // Wait for debounce time + buffer
        await new Promise((resolve) => setTimeout(resolve, BUILDER_DICTIONARY.timeouts.formDebounceMs + 50));

        expect(component.stateSignal()['txt1']).toBe('Debounced change');
    });

    it('should patch form when stateSignal is changed externally', () => {
        fixture.detectChanges();

        component.stateSignal.set({
            comp1: { f1: 'External Change', f2: [], f3: null },
            txt1: 'External Text',
            chk1: [],
        });

        // Angular effects run during change detection / requestAnimationFrame
        fixture.detectChanges();

        expect(component.form.get('comp1.f1')?.value).toBe('External Change');
        expect(component.form.get('txt1')?.value).toBe('External Text');
    });

    it('should mark all fields as touched when triggerValidation is activated', () => {
        fixture.detectChanges();

        expect(component.form.touched).toBe(false);

        builderState.triggerValidation.set(1);
        fixture.detectChanges();

        expect(component.form.touched).toBe(true);
    });
});
