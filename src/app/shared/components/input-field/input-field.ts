import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { TuiInput, TuiTextfield, TuiLabel, TuiError } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { BUILDER_DICTIONARY } from '@shared/constants';

/**
 * Reusable single-line text input component with floating labels.
 * Implements ControlValueAccessor to integrate seamlessly with Angular's Reactive Forms.
 * Wraps Taiga UI's tuiInput and tuiTextfield.
 */
@Component({
    selector: 'app-input-field',
    imports: [FormsModule, TuiInput, TuiTextfield, TuiLabel, TuiError],
    templateUrl: './input-field.html',
    styleUrl: './input-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputField implements ControlValueAccessor, OnInit, OnDestroy {
    private readonly cdr = inject(ChangeDetectorRef);
    readonly ngControl = inject(NgControl, { optional: true, self: true });
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

    ngOnInit() {
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

    ngOnDestroy() {
        if (this.statusSub) {
            this.statusSub.unsubscribe();
        }
    }

    /** The floating label for the text field, supplied by the dictionary */
    label = input.required<string>();

    /** Optional placeholder text */
    placeholder = input<string>('');

    /** Optional Taiga UI icon to display at the start of the field */
    iconStart = input<string>('');

    /** Maximum allowed characters */
    maxLength = input<number | null>(null);

    /** Whether the field is required */
    required = input<boolean>(false);

    /** Internal value bound to the native input */
    value = '';

    /** Tracks the disabled state for Reactive Forms */
    disabled = false;

    private static nextId = 0;
    protected readonly fieldId = `input-field-${InputField.nextId++}`;

    private onChange: (value: string) => void = () => undefined;
    onTouched: () => void = () => undefined;

    writeValue(val: string): void {
        this.value = val || '';
        this.cdr.markForCheck();
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onModelChange(val: string) {
        this.value = val;
        this.onChange(val);
        this.onTouched();
    }
}
