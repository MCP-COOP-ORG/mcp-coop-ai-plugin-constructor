import { Component, ChangeDetectionStrategy, input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TuiRadio } from '@taiga-ui/core';

import { SelectOption } from '@shared/models';

/**
 * Reusable Radio Group component for the builder form.
 * Implements ControlValueAccessor to integrate seamlessly with Angular's Reactive Forms.
 * Uses Taiga UI radio buttons styled as interactive cards.
 */
@Component({
    selector: 'app-radio-group',
    imports: [FormsModule, TuiRadio],
    templateUrl: './radio-group.html',
    styleUrl: './radio-group.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioGroup),
            multi: true,
        },
    ],
})
export class RadioGroup implements ControlValueAccessor {
    /**
     * Array of options to render as interactive radio cards.
     */
    options = input.required<SelectOption[]>();

    /** Internal selected value */
    value: string | null = null;

    /** Tracks the disabled state */
    disabled = false;

    private onChange: (value: string | null) => void = () => undefined;
    private onTouched: () => void = () => undefined;

    writeValue(val: string | null): void {
        this.value = val;
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onRadioChange(optionId: string) {
        if (this.disabled) return;
        this.value = optionId;
        this.onChange(this.value);
        this.onTouched();
    }
}
