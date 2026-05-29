import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextarea } from '@taiga-ui/kit';
import { TuiTextfield, TuiLabel, TuiError } from '@taiga-ui/core';
import { BUILDER_DICTIONARY } from '@shared/constants';
import { BaseFormField } from '@shared/directives';

/**
 * Reusable Textarea component with floating labels and character limits.
 * Inherits CVA, validation, and layout bindings from BaseFormField.
 */
@Component({
    selector: 'app-textarea-field',
    imports: [FormsModule, TuiTextarea, TuiTextfield, TuiLabel, TuiError],
    templateUrl: './textarea-field.html',
    styleUrl: './textarea-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaField extends BaseFormField<string> {
    /** Maximum number of characters allowed in the textarea */
    limit = input<number>(BUILDER_DICTIONARY.limits.textareaDefaultLimit);

    /** Minimum visible height of the textarea in lines */
    minRows = input<number>(3);

    /** Maximum visible height of the textarea in lines */
    maxRows = input<number>(6);

    /** Optional Taiga UI icon to display at the start of the field */
    iconStart = input<string>('');

    override value = '';

    override writeValue(val: string | null): void {
        super.writeValue(val || '');
    }
}
