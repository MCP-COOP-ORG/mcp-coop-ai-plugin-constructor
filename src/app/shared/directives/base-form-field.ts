import { Directive, ChangeDetectorRef, OnInit, OnDestroy, inject, input } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BUILDER_DICTIONARY } from '@shared/constants';

@Directive()
export abstract class BaseFormField<T> implements ControlValueAccessor, OnInit, OnDestroy {
    protected readonly cdr = inject(ChangeDetectorRef);
    readonly ngControl = inject(NgControl, { optional: true, self: true });

    readonly label = input<string>('');
    readonly placeholder = input<string>('');

    value: T | null = null;
    disabled = false;

    protected onChange: (value: T | null) => void = () => undefined;
    protected onTouched: () => void = () => undefined;

    private statusSub?: Subscription;

    readonly view = {
        dict: BUILDER_DICTIONARY,
    };

    get errorMessage(): string | null {
        if (!this.ngControl?.invalid || !this.ngControl?.touched) return null;
        const errors = this.ngControl.errors;
        if (!errors) return null;

        const vDict = this.view.dict.validation;
        if (errors['required']) return vDict.required;
        if (errors['minlength']) return vDict.minLength.replace('{{min}}', errors['minlength'].requiredLength);
        if (errors['maxlength']) return vDict.maxLength.replace('{{max}}', errors['maxlength'].requiredLength);
        return vDict.invalid;
    }

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    ngOnInit(): void {
        const control = this.ngControl?.control;
        if (control) {
            this.statusSub = control.statusChanges.subscribe(() => {
                this.cdr.markForCheck();
            });
            const originalMarkAsTouched = control.markAsTouched.bind(control);
            control.markAsTouched = (opts) => {
                originalMarkAsTouched(opts);
                this.cdr.markForCheck();
            };
        }
    }

    ngOnDestroy(): void {
        if (this.statusSub) {
            this.statusSub.unsubscribe();
        }
    }

    writeValue(val: T | null): void {
        this.value = val;
        this.cdr.markForCheck();
    }

    registerOnChange(fn: (value: T | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.cdr.markForCheck();
    }

    onModelChange(val: T | null): void {
        if (this.disabled) return;
        this.value = val;
        this.onChange(val);
        this.onTouched();
    }
}
