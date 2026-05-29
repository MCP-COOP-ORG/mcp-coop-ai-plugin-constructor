import { Directive, inject, OnInit, WritableSignal, DestroyRef, effect } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { BuilderState } from '@services';
import { BUILDER_DICTIONARY } from '@shared/constants';
import { FormStepView } from '@shared/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

@Directive()
export abstract class BaseFormStep implements OnInit {
    protected readonly builderState = inject(BuilderState);
    protected readonly destroyRef = inject(DestroyRef);

    abstract readonly view: FormStepView;

    form!: FormGroup;

    // Each child step must define which signal it binds to
    protected abstract get stateSignal(): WritableSignal<Record<string, unknown>>;

    constructor() {
        effect(() => {
            const state = this.stateSignal();
            // Form might not be initialized when the effect first runs
            if (!this.form) return;

            // Prevent cursor jumping by only patching if the state actually differs from the form
            const currentState = this.form.getRawValue();
            if (JSON.stringify(currentState) !== JSON.stringify(state)) {
                this.form.patchValue(state, { emitEvent: false });
            }
        });

        effect(() => {
            const trigger = this.builderState.triggerValidation();
            if (trigger > 0 && this.form) {
                this.form.markAllAsTouched();
            }
        });
    }

    ngOnInit() {
        this.form = new FormGroup(
            this.view.blocksArray.reduce(
                (acc, block) => {
                    if (block.type === 'composite' && block.fields) {
                        const nestedGroup: Record<string, FormControl> = {};
                        block.fields.forEach((field) => {
                            const isArray = field.type === 'checkbox' || field.type === 'multi-select';
                            let defaultValue: string | string[] | null = isArray ? [] : '';
                            if (field.type === 'select' || field.type === 'radio') {
                                defaultValue = null;
                            }
                            const validatorsArr: ValidatorFn[] = [];
                            if (field.validators) {
                                field.validators.forEach((v) => {
                                    if (v === 'required') validatorsArr.push(Validators.required);
                                    if (v.startsWith('maxLength:')) {
                                        const max = parseInt(v.split(':')[1], 10);
                                        validatorsArr.push(Validators.maxLength(max));
                                    }
                                    if (v.startsWith('minLength:')) {
                                        const min = parseInt(v.split(':')[1], 10);
                                        validatorsArr.push(Validators.minLength(min));
                                    }
                                });
                            }
                            nestedGroup[field.id] = new FormControl(defaultValue, validatorsArr);
                        });
                        acc[block.id] = new FormGroup(nestedGroup);
                    } else {
                        let defaultValue: string | string[] | null;
                        if (block.type === 'checkbox') {
                            defaultValue = block.default && block.options ? block.options.map((o) => o.id) : [];
                        } else {
                            defaultValue = block.defaultOptionId || (block.type === 'textarea' ? '' : null);
                        }
                        acc[block.id] = new FormControl(defaultValue);
                    }
                    return acc;
                },
                {} as Record<string, FormControl | FormGroup>,
            ),
        );

        const initialData = this.stateSignal();
        if (Object.keys(initialData).length > 0) {
            this.form.patchValue(initialData);
        } else {
            this.stateSignal.set(this.form.getRawValue() as Record<string, unknown>);
        }

        this.builderState.isStepValid.set(this.form.valid);

        this.form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((status) => {
            this.builderState.isStepValid.set(status === 'VALID');
        });

        this.form.valueChanges
            .pipe(debounceTime(BUILDER_DICTIONARY.timeouts.formDebounceMs), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.stateSignal.set(this.form.getRawValue() as Record<string, unknown>);
            });
    }
}
