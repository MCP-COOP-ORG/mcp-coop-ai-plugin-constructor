import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiRadio } from '@taiga-ui/core';
import { SelectOption } from '@shared/models';
import { BaseFormField } from '@shared/directives';

/**
 * Reusable Radio Group component for the builder form.
 * Inherits CVA, validation, and layout bindings from BaseFormField.
 * Uses Taiga UI radio buttons styled as interactive cards.
 */
@Component({
    selector: 'app-radio-group',
    imports: [FormsModule, TuiRadio],
    templateUrl: './radio-group.html',
    styleUrl: './radio-group.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroup extends BaseFormField<string> {
    /**
     * Array of options to render as interactive radio cards.
     */
    options = input.required<SelectOption[]>();

    onRadioChange(optionId: string) {
        this.onModelChange(optionId);
    }
}
