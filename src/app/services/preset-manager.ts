import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BuilderState } from './builder-state';
import { TuiNotificationService } from '@taiga-ui/core';
import { BUILDER_DICTIONARY } from '@shared/constants';
import { GENERATED_PRESETS } from '@shared/configs';
import { Preset } from '@shared/models';

@Injectable({
    providedIn: 'root',
})
export class PresetManager {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly builderState = inject(BuilderState);
    private readonly notifications = inject(TuiNotificationService);
    private readonly STORAGE_KEY = BUILDER_DICTIONARY.storageKeys.presets;
    private readonly MAX_PRESETS = BUILDER_DICTIONARY.limits.presetsLimit;

    readonly presets = signal<Preset[]>([]);
    readonly userPresets = computed(() => this.presets().filter((p) => !p.isSystem));

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadPresetsFromStorage();
        }
    }

    get currentPresets(): Preset[] {
        return this.presets();
    }

    saveCurrentStateAsPreset(name: string): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const stateToSave = this.builderState.createSnapshot();

        // Remove any GENERATED_PRESETS before finding index, because we only save to local storage
        const localPresets = this.presets().filter((p) => !p.isSystem);

        const finalName = name.trim() || `${BUILDER_DICTIONARY.presets.defaultNamePrefix} ${localPresets.length + 1}`;
        const existingIndex = localPresets.findIndex((p) => p.name.toLowerCase() === finalName.toLowerCase());

        if (existingIndex !== -1) {
            if (stateToSave.description?.projectIdentity) {
                stateToSave.description.projectIdentity.preset = localPresets[existingIndex].id;
            }
            localPresets[existingIndex] = {
                ...localPresets[existingIndex],
                state: stateToSave,
                createdAt: Date.now(),
            };
        } else {
            const newId = Date.now().toString();
            if (stateToSave.description?.projectIdentity) {
                stateToSave.description.projectIdentity.preset = newId;
            }
            const newPreset: Preset = {
                id: newId,
                name: finalName,
                state: stateToSave,
                createdAt: Date.now(),
                isSystem: false,
            };

            if (localPresets.length >= this.MAX_PRESETS) {
                localPresets.sort((a, b) => b.createdAt - a.createdAt); // newest first
                localPresets.pop(); // remove oldest
            }
            localPresets.push(newPreset);
        }

        this.savePresetsToStorage(localPresets);
        this.reloadPresets();

        this.notifications
            .open(BUILDER_DICTIONARY.presets.savedMessage, {
                label: BUILDER_DICTIONARY.presets.savedLabel,
                icon: '@tui.check',
                appearance: 'success',
            })
            .subscribe();
    }

    loadPreset(id: string): void {
        const preset = this.presets().find((p) => p.id === id);
        if (!preset) return;

        this.builderState.restoreSnapshot(preset.state);

        this.notifications
            .open(BUILDER_DICTIONARY.presets.loadedMessage, {
                label: BUILDER_DICTIONARY.presets.loadedLabel,
                icon: '@tui.info',
                appearance: 'info',
            })
            .subscribe();
    }

    deletePreset(id: string): void {
        const localPresets = this.presets().filter((p) => !p.isSystem && p.id !== id);
        this.savePresetsToStorage(localPresets);
        this.reloadPresets();
    }

    private loadPresetsFromStorage(): void {
        this.reloadPresets();
    }

    private reloadPresets(): void {
        let localPresets: Preset[] = [];
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                localPresets = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to parse presets from localStorage', e);
        }

        // Sort local presets by date descending
        localPresets.sort((a, b) => b.createdAt - a.createdAt);

        // Append system presets
        const allPresets = [...localPresets, ...GENERATED_PRESETS];
        this.presets.set(allPresets);
    }

    private savePresetsToStorage(presets: Preset[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
        } catch (e) {
            console.error('Failed to save presets to localStorage', e);
        }
    }
}
