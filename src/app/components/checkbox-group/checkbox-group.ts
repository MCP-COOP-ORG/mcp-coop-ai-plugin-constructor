import { Component, ChangeDetectionStrategy, input, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TuiCheckbox, TuiIcon } from '@taiga-ui/core';
import { ConfigItem, RecommendationStatus } from '@shared/models';
import { RecommendationEngine, TemplateInterpolator, BuilderState, DialogManager } from '@services';
import { BUILDER_DICTIONARY } from '@shared/constants';

/**
 * Reusable Checkbox Group component for the builder form.
 * Implements ControlValueAccessor to integrate seamlessly with Angular's Reactive Forms.
 * Uses Taiga UI checkboxes styled as interactive cards with recommendation highlighting.
 */
@Component({
    selector: 'app-checkbox-group',
    imports: [FormsModule, TuiCheckbox, TuiIcon],
    templateUrl: './checkbox-group.html',
    styleUrl: './checkbox-group.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxGroup),
            multi: true,
        },
    ],
})
export class CheckboxGroup implements ControlValueAccessor {
    private readonly recommendationEngine = inject(RecommendationEngine);
    private readonly dialogManager = inject(DialogManager);
    private readonly interpolator = inject(TemplateInterpolator);
    private readonly builderState = inject(BuilderState);

    readonly view = {
        dictionary: BUILDER_DICTIONARY,
    } as const;

    /**
     * Array of options to render as interactive checkbox cards.
     * Driven by ConfigItem data to adhere to the Single Source of Truth pattern.
     */
    options = input.required<ConfigItem[]>();

    /** Internal dictionary to map option IDs to their boolean selected state */
    value: Record<string, boolean> = {};

    private onChange: (value: string[]) => void = () => undefined;
    private onTouched: () => void = () => undefined;

    writeValue(val: string[]): void {
        const newValue: Record<string, boolean> = {};

        // Initialize all available options to false (prevents indeterminate 'minus' state)
        const currentOptions = this.options();
        if (currentOptions) {
            currentOptions.forEach((opt) => (newValue[opt.id] = false));
        }

        if (val && Array.isArray(val)) {
            val.forEach((id) => (newValue[id] = true));
        }

        this.value = newValue;
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onCheckboxChange() {
        const selectedIds = Object.keys(this.value).filter((k) => this.value[k]);
        this.onChange(selectedIds);
        this.onTouched();
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
