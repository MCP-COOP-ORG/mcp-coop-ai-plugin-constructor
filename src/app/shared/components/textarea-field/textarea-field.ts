import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { TuiTextarea } from '@taiga-ui/kit';
import { TuiTextfield, TuiLabel, TuiError } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { BUILDER_DICTIONARY } from '@shared/constants';

/**
 * Reusable Textarea component with floating labels and character limits.
 * Implements ControlValueAccessor to integrate seamlessly with Angular's Reactive Forms.
 * Wraps Taiga UI's tuiTextarea and tuiTextfield.
 */
@Component({
    selector: 'app-textarea-field',
    imports: [FormsModule, TuiTextarea, TuiTextfield, TuiLabel, TuiError],
    templateUrl: './textarea-field.html',
    styleUrl: './textarea-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaField implements ControlValueAccessor, OnInit, OnDestroy {
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

    /** Maximum number of characters allowed in the textarea */
    limit = input<number>(BUILDER_DICTIONARY.limits.textareaDefaultLimit);

    /** Minimum visible height of the textarea in lines */
    minRows = input<number>(3);

    /** Maximum visible height of the textarea in lines */
    maxRows = input<number>(6);

    /** Optional Taiga UI icon to display at the start of the field */
    iconStart = input<string>('');

    /** Internal value bound to the native textarea */
    value = '';

    /** Tracks the disabled state for Reactive Forms */
    disabled = false;

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
