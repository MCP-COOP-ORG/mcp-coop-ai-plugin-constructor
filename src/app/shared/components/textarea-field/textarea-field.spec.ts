import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl, ValidationErrors } from '@angular/forms';

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

import { TextareaField } from './textarea-field';

describe('TextareaField', () => {
    let component: TextareaField;
    let fixture: ComponentFixture<TextareaField>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TextareaField],
        }).compileComponents();

        fixture = TestBed.createComponent(TextareaField);
        fixture.componentRef.setInput('label', 'Test Label');
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create and execute default callbacks', () => {
        expect(component).toBeTruthy();
        expect(() => component['onChange']('')).not.toThrow();
        expect(() => component['onTouched']()).not.toThrow();
    });

    it('should write value', () => {
        component.writeValue('test value');
        expect(component.value).toBe('test value');
    });

    it('should register on change', () => {
        const fn = () => undefined;
        component.registerOnChange(fn);
        expect(component['onChange']).toBe(fn);
    });

    it('should register on touched', () => {
        const fn = () => undefined;
        component.registerOnTouched(fn);
        expect(component['onTouched']).toBe(fn);
    });

    it('should set disabled state', () => {
        component.setDisabledState(true);
        expect(component.disabled).toBe(true);
        component.setDisabledState(false);
        expect(component.disabled).toBe(false);
    });

    it('should trigger change event on input change', () => {
        let changedValue = '';
        component.registerOnChange((val: string) => {
            changedValue = val;
        });
        component.onModelChange('new value');
        expect(changedValue).toBe('new value');
        expect(component.value).toBe('new value');
    });
});

describe('TextareaField with NgControl', () => {
    let component: TextareaField;
    let fixture: ComponentFixture<TextareaField>;
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
            imports: [TextareaField],
        })
            .overrideComponent(TextareaField, {
                set: {
                    providers: [{ provide: NgControl, useValue: mockNgControl as unknown as NgControl }],
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(TextareaField);
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
