import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiCheckbox, TuiIcon } from '@taiga-ui/core';
import { ConfigItem, RecommendationStatus } from '@shared/models';
import { RecommendationEngine, TemplateInterpolator, BuilderState, DialogManager } from '@services';
import { BUILDER_DICTIONARY } from '@shared/constants';
import { BaseFormField } from '@shared/directives';

/**
 * Reusable Checkbox Group component for the builder form.
 * Inherits CVA, validation, and layout bindings from BaseFormField.
 * Uses Taiga UI checkboxes styled as interactive cards with recommendation highlighting.
 */
@Component({
    selector: 'app-checkbox-group',
    imports: [FormsModule, TuiCheckbox, TuiIcon],
    templateUrl: './checkbox-group.html',
    styleUrl: './checkbox-group.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxGroup extends BaseFormField<string[]> {
    private readonly recommendationEngine = inject(RecommendationEngine);
    private readonly dialogManager = inject(DialogManager);
    private readonly interpolator = inject(TemplateInterpolator);
    private readonly builderState = inject(BuilderState);

    readonly dictionary = BUILDER_DICTIONARY;

    /**
     * Array of options to render as interactive checkbox cards.
     * Driven by ConfigItem data to adhere to the Single Source of Truth pattern.
     */
    options = input.required<ConfigItem[]>();

    /** Internal dictionary to map option IDs to their boolean selected state */
    selectedMap: Record<string, boolean> = {};

    override writeValue(val: string[] | null): void {
        super.writeValue(val || []);

        const newValue: Record<string, boolean> = {};
        const currentOptions = this.options();
        if (currentOptions) {
            currentOptions.forEach((opt) => (newValue[opt.id] = false));
        }

        if (this.value && Array.isArray(this.value)) {
            this.value.forEach((id) => (newValue[id] = true));
        }

        this.selectedMap = newValue;
    }

    onCheckboxChange() {
        const selectedIds = Object.keys(this.selectedMap).filter((k) => this.selectedMap[k]);
        this.onModelChange(selectedIds);
    }

    /**
     * Gets the recommendation status ('recommended' | 'discouraged' | undefined)
     * for a given item ID from the central RecommendationEngine.
     */
    getStatus(itemId: string): RecommendationStatus | undefined {
        return this.recommendationEngine.getStatus(itemId);
    }

    showInfo(event: Event, option: ConfigItem): void {
        event.preventDefault();
        event.stopPropagation();

        this.interpolator.fetchJson<{ description: Record<string, string> }>(option.filePath).then((json) => {
            if (!json?.description) return;

            const review = this.builderState.reviewData();
            const agent = review.aiAgent || BUILDER_DICTIONARY.common.defaultAssetKey;
            const content =
                json.description[agent] ?? json.description[BUILDER_DICTIONARY.common.defaultAssetKey] ?? '';

            this.dialogManager.openInfoDialog(option.label, content).subscribe();
        });
    }
}
