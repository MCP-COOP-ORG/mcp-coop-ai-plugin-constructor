import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseFormField } from './base-form-field';
import { TestBed } from '@angular/core/testing';
import { NgControl, FormControl, Validators, ControlValueAccessor } from '@angular/forms';
import { vi } from 'vitest';

@Component({
    template: '',
    providers: [],
})
class TestFieldComponent extends BaseFormField<string> {
    constructor() {
        super();
    }
}

describe('BaseFormField', () => {
    let cdrMock: { markForCheck: ReturnType<typeof vi.fn> } & Partial<ChangeDetectorRef>;
    let ngControlMock: {
        valueAccessor: ControlValueAccessor | null;
        control: FormControl;
        readonly invalid: boolean;
        readonly touched: boolean;
        readonly errors: Record<string, unknown> | null;
    };

    beforeEach(() => {
        cdrMock = {
            markForCheck: vi.fn(),
        } as { markForCheck: ReturnType<typeof vi.fn> } & ChangeDetectorRef;

        ngControlMock = {
            valueAccessor: null,
            control: new FormControl('initial', [Validators.required, Validators.minLength(5)]),
            get invalid() {
                return this.control?.invalid ?? false;
            },
            get touched() {
                return this.control?.touched ?? false;
            },
            get errors() {
                return (this.control?.errors as Record<string, unknown> | null) ?? null;
            },
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: ChangeDetectorRef, useValue: cdrMock },
                { provide: NgControl, useValue: ngControlMock },
            ],
        });
    });

    it('should assign valueAccessor on construct', () => {
        TestBed.runInInjectionContext(() => {
            const field = new TestFieldComponent();
            expect(ngControlMock.valueAccessor).toBe(field);
        });
    });

    it('should manage CVA methods', () => {
        TestBed.runInInjectionContext(() => {
            const field = new TestFieldComponent();
            const changeSpy = vi.fn();
            const touchSpy = vi.fn();

            field.registerOnChange(changeSpy);
            field.registerOnTouched(touchSpy);

            field.writeValue('new-val');
            expect(field.value).toBe('new-val');
            expect(cdrMock.markForCheck).toHaveBeenCalled();

            field.onModelChange('model-val');
            expect(field.value).toBe('model-val');
            expect(changeSpy).toHaveBeenCalledWith('model-val');
            expect(touchSpy).toHaveBeenCalled();

            field.setDisabledState(true);
            expect(field.disabled).toBe(true);
        });
    });

    it('should resolve errorMessage', () => {
        TestBed.runInInjectionContext(() => {
            const field = new TestFieldComponent();
            field.ngOnInit();

            expect(field.errorMessage).toBeNull();

            ngControlMock.control.setValue('');
            ngControlMock.control.markAsTouched();

            expect(field.errorMessage).toBe('This field is required.');

            ngControlMock.control.setValue('123');
            expect(field.errorMessage).toContain('Minimum length');

            field.ngOnDestroy();
        });
    });
});
