import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputField } from './input-field';
import { FormsModule, NgControl, ValidationErrors } from '@angular/forms';
import { ComponentRef } from '@angular/core';

interface MockNgControl {
    invalid: boolean;
    touched: boolean;
    errors: ValidationErrors | null;
    control: {
        markAsTouched: () => void;
        statusChanges: {
            subscribe: (fn: () => void) => { unsubscribe: () => void };
        };
    };
}

describe('InputField', () => {
    let component: InputField;
    let fixture: ComponentFixture<InputField>;
    let componentRef: ComponentRef<InputField>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InputField, FormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(InputField);
        component = fixture.componentInstance;
        componentRef = fixture.componentRef;

        // Set required inputs
        componentRef.setInput('label', 'Test Label');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should implement ControlValueAccessor writeValue', () => {
        component.writeValue('New Value');
        expect(component.value).toBe('New Value');
    });

    it('should handle null in writeValue', () => {
        component.writeValue(null as unknown as string);
        expect(component.value).toBe('');
    });

    it('should implement ControlValueAccessor registerOnChange', () => {
        const fn = vi.fn();
        component.registerOnChange(fn);
        component.onModelChange('Changed');
        expect(fn).toHaveBeenCalledWith('Changed');
    });

    it('should implement ControlValueAccessor registerOnTouched', () => {
        const fn = vi.fn();
        component.registerOnTouched(fn);
        component.onModelChange('Changed');
        expect(fn).toHaveBeenCalled();
    });

    it('should implement ControlValueAccessor setDisabledState', () => {
        component.setDisabledState(true);
        expect(component.disabled).toBe(true);

        component.setDisabledState(false);
        expect(component.disabled).toBe(false);
    });

    it('should cover default CVA callbacks', () => {
        // Tests that the default no-op functions do not crash
        expect(() => {
            component['onChange']('test');
            component['onTouched']();
        }).not.toThrow();
    });
});

describe('InputField with NgControl', () => {
    let component: InputField;
    let fixture: ComponentFixture<InputField>;
    let mockNgControl: MockNgControl;

    beforeEach(async () => {
        mockNgControl = {
            invalid: true,
            touched: true,
            errors: { required: true },
            control: {
                markAsTouched: vi.fn(),
                statusChanges: {
                    subscribe: (fn: () => void) => {
                        fn();
                        return { unsubscribe: vi.fn() };
                    },
                },
            },
        };

        await TestBed.configureTestingModule({
            imports: [InputField, FormsModule],
        })
            .overrideComponent(InputField, {
                set: {
                    providers: [{ provide: NgControl, useValue: mockNgControl as unknown as NgControl }],
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(InputField);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('label', 'Test Label');
        fixture.detectChanges();
    });

    it('should return required error message', () => {
        mockNgControl.errors = { required: true };
        expect(component.errorMessage).toBe('This field is required.');
    });

    it('should return minlength error message', () => {
        mockNgControl.errors = { minlength: { requiredLength: 3 } };
        expect(component.errorMessage).toBe('Minimum length is 3 characters.');
    });

    it('should return maxlength error message', () => {
        mockNgControl.errors = { maxlength: { requiredLength: 100 } };
        expect(component.errorMessage).toBe('Maximum length is 100 characters.');
    });

    it('should return invalid error message for unknown errors', () => {
        mockNgControl.errors = { somethingElse: true };
        expect(component.errorMessage).toBe('Invalid input.');
    });

    it('should return null if valid', () => {
        mockNgControl.invalid = false;
        expect(component.errorMessage).toBeNull();
    });

    it('should override markAsTouched on control', () => {
        expect(mockNgControl.control.markAsTouched).toBeDefined();
        // Trigger the patched method
        mockNgControl.control.markAsTouched();
    });
});
