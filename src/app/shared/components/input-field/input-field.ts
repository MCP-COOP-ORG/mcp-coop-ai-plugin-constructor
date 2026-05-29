import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiInput, TuiTextfield, TuiLabel, TuiError } from '@taiga-ui/core';
import { BaseFormField } from '@shared/directives';

/**
 * Reusable single-line text input component with floating labels.
 * Inherits CVA, validation, and layout bindings from BaseFormField.
 */
@Component({
    selector: 'app-input-field',
    imports: [FormsModule, TuiInput, TuiTextfield, TuiLabel, TuiError],
    templateUrl: './input-field.html',
    styleUrl: './input-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputField extends BaseFormField<string> {
    /** Optional Taiga UI icon to display at the start of the field */
    iconStart = input<string>('');

    /** Maximum allowed characters */
    maxLength = input<number | null>(null);

    /** Whether the field is required */
    required = input<boolean>(false);

    override value = '';

    override writeValue(val: string | null): void {
        super.writeValue(val || '');
    }

    private static nextId = 0;
    protected readonly fieldId = `input-field-${InputField.nextId++}`;
}
