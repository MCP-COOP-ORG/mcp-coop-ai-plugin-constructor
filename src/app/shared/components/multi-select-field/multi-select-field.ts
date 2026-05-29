import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    forwardRef,
    inject,
    input,
    signal,
    computed,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TuiTextfield, TuiLabel, TuiDataList, TuiIcon } from '@taiga-ui/core';
import { TuiInputChip, TuiChevron, TuiMultiSelect } from '@taiga-ui/kit';
import { DialogManager } from '@services';
import { TemplateInterpolator, BuilderState } from '@services';
import { BUILDER_DICTIONARY, STATE_KEYS } from '@shared/constants';
import { SelectOption } from '@shared/models';

/**
 * Reusable Multi-Select component with checkboxes and chips.
 * Implements ControlValueAccessor to integrate seamlessly with Angular's Reactive Forms.
 * Wraps Taiga UI's tuiInputChip and tui-data-list.
 */
@Component({
    selector: 'app-multi-select-field',
    imports: [FormsModule, TuiTextfield, TuiLabel, TuiDataList, TuiInputChip, TuiChevron, TuiMultiSelect, TuiIcon],
    templateUrl: './multi-select-field.html',
    styleUrl: './multi-select-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectField),
            multi: true,
        },
    ],
})
export class MultiSelectField implements ControlValueAccessor {
    readonly dictionary = BUILDER_DICTIONARY;
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly dialogManager = inject(DialogManager);
    private readonly interpolator = inject(TemplateInterpolator);
    private readonly builderState = inject(BuilderState);

    /** The floating label for the field */
    label = input.required<string>();

    /** Placeholder text when nothing is selected */
    placeholder = input<string>('');

    /** Array of objects to populate the dropdown */
    options = input<SelectOption[]>([]);

    /** Internal value bound to the native input */
    value: string[] = [];

    /** Tracks the disabled state for Reactive Forms */
    disabled = false;
    search = signal<string>('');

    private static nextId = 0;
    protected readonly fieldId = `multi-select-field-${MultiSelectField.nextId++}`;

    private onChange: (value: string[]) => void = () => undefined;
    private onTouched: () => void = () => undefined;

    /** Converts the selected ID back to the display label for the chips */
    readonly stringify = (id: string): string => {
        return this.options().find((opt) => opt.id === id)?.label || id;
    };

    readonly filteredOptions = computed(() => {
        const s = this.search().toLowerCase();
        const all = this.options();

        const minLength = BUILDER_DICTIONARY.limits.dropdownSearchMinLength;

        const filtered = s.length >= minLength ? all.filter((o) => o.label.toLowerCase().includes(s)) : all;

        return filtered;
    });

    onSearch(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        this.search.set(inputElement.value);
    }

    showInfo(event: Event, option: SelectOption): void {
        event.preventDefault();
        event.stopPropagation();

        if (option.description) {
            this.dialogManager.openInfoDialog(option.label, option.description).subscribe();
            return;
        }

        if (!option.filePath) return;

        this.interpolator.fetchJson<{ description: Record<string, string> }>(option.filePath).then((json) => {
            if (!json?.description) return;
            const review = this.builderState.reviewData();
            const agent = (review[STATE_KEYS.AI_AGENT] as string) || BUILDER_DICTIONARY.common.defaultAssetKey;
            const content =
                json.description[agent] ?? json.description[BUILDER_DICTIONARY.common.defaultAssetKey] ?? '';
            this.dialogManager.openInfoDialog(option.label, content).subscribe();
        });
    }

    writeValue(val: string[]): void {
        this.value = Array.isArray(val) ? val : [];
        this.search.set(''); // reset search when form changes value
        this.cdr.markForCheck();
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onModelChange(val: string[]) {
        this.value = val;
        this.search.set(''); // reset input on selection
        this.onChange(val);
        this.onTouched();
    }
}
