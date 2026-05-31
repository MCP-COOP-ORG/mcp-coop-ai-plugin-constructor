import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GENERATED_PAGES_CONFIG } from '@shared/configs';
import { ConfigCategory } from '@shared/models';
import { StepLayout, RadioGroup, TextareaField } from '@shared/components';
import { BaseFormStep } from '@shared/directives';
import { CheckboxGroup } from '../checkbox-group/checkbox-group';
import { WritableSignal } from '@angular/core';

/**
 * A universal component that dynamically renders any form step based on the provided route data.
 */
@Component({
    selector: 'app-dynamic-form-step',
    imports: [StepLayout, RadioGroup, CheckboxGroup, TextareaField, ReactiveFormsModule],
    templateUrl: './dynamic-form-step.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormStep extends BaseFormStep implements OnInit {
    private readonly route = inject(ActivatedRoute);

    // The stepId is injected via route data
    private stepId = this.route.snapshot.data['stepId'] as string;

    /**
     * View Model containing all data from the generated file-system based configuration.
     */
    readonly view = {
        step: GENERATED_PAGES_CONFIG[this.stepId],
        blocksArray: GENERATED_PAGES_CONFIG[this.stepId].categories
            .filter((cat: ConfigCategory) => cat.visibility !== false)
            .map((cat: ConfigCategory) => ({
                ...cat,
                options: cat.items.filter((item) => item.visibility === true),
                ...(cat.default ? { default: cat.default } : {}),
            }))
            .filter((cat) => cat.options.length > 0),
    };

    protected override get stateSignal(): WritableSignal<Record<string, unknown>> {
        // Return the specific dynamically pre-initialized signal for this step
        return this.builderState.dynamicData[this.stepId];
    }
}
