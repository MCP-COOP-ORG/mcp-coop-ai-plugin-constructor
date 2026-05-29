import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiLabel, TuiTextfield, TuiInput, TuiTitle } from '@taiga-ui/core';
import { TuiAccordion } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { PresetManager } from '@services';
import { BUILDER_DICTIONARY } from '@shared/constants';

@Component({
    selector: 'app-preset-dialog',
    imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiTextfield, TuiLabel, TuiInput, TuiAccordion, TuiTitle],
    templateUrl: './preset-dialog.html',
    styleUrl: './preset-dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresetDialogComponent {
    readonly context = inject<TuiDialogContext<void>>(POLYMORPHEUS_CONTEXT);
    readonly presetManager = inject(PresetManager);
    private readonly fb = inject(FormBuilder);

    readonly dictionary = BUILDER_DICTIONARY.presets;
    readonly maxPresets = BUILDER_DICTIONARY.limits.presetsLimit;
    readonly dateFormat = BUILDER_DICTIONARY.review.dateFormat;

    readonly presetForm = this.fb.group({
        name: ['', Validators.required],
    });

    savePreset(): void {
        if (this.presetForm.valid && this.presetManager.userPresets().length < this.maxPresets) {
            this.presetManager.saveCurrentStateAsPreset(this.presetForm.value.name ?? '');
            this.context.completeWith();
        }
    }

    cancel(): void {
        this.context.completeWith();
    }

    selectPreset(name: string): void {
        this.presetForm.patchValue({ name });
    }

    deletePreset(id: string, event: Event): void {
        event.stopPropagation();
        this.presetManager.deletePreset(id);
    }
}
