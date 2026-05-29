import { ChangeDetectionStrategy, Component, inject, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield, TuiLabel, TuiDataList, TuiDropdown, TuiIcon } from '@taiga-ui/core';
import { TuiChevron, TuiComboBox } from '@taiga-ui/kit';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { DialogManager } from '@services';
import { TemplateInterpolator, BuilderState } from '@services';
import { BUILDER_DICTIONARY, STATE_KEYS } from '@shared/constants';
import { SelectOption } from '@shared/models';
import { BaseFormField } from '@shared/directives';

@Component({
    selector: 'app-select-field',
    imports: [FormsModule, TuiTextfield, TuiLabel, TuiChevron, TuiComboBox, TuiDataList, TuiDropdown, TuiIcon],
    templateUrl: './select-field.html',
    styleUrl: './select-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectField extends BaseFormField<string> {
    readonly dictionary = BUILDER_DICTIONARY;
    private readonly dialogManager = inject(DialogManager);
    private readonly interpolator = inject(TemplateInterpolator);
    private readonly builderState = inject(BuilderState);

    options = input<SelectOption[]>([]);
    search = signal<string>('');

    private static nextId = 0;
    protected readonly fieldId = `select-field-${SelectField.nextId++}`;

    protected readonly stringify: TuiStringHandler<string> = (id) =>
        this.options().find((item) => item.id === id)?.label ?? '';

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

    override writeValue(val: string | null): void {
        super.writeValue(val);
        this.search.set('');
    }
}
