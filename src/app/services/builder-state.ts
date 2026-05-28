import { Injectable, signal, effect, PLATFORM_ID, inject, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GENERATED_PAGES_CONFIG } from '@shared/configs';
import { BuilderSnapshot } from '@shared/models';

@Injectable({
    providedIn: 'root',
})
export class BuilderState {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly STORAGE_KEY = 'builderState';

    // Signals for custom steps
    readonly descriptionData = signal<Record<string, unknown>>({});
    readonly reviewData = signal<Record<string, unknown>>({});
    readonly editedFiles = signal<Record<string, string>>({});
    readonly isStepValid = signal<boolean>(true);
    readonly triggerValidation = signal<number>(0);

    // Dynamic signals for all generated pages
    readonly dynamicData: Record<string, WritableSignal<Record<string, unknown>>> = {};

    constructor() {
        // Initialize a signal for every generated page dynamically
        Object.keys(GENERATED_PAGES_CONFIG).forEach((stepId) => {
            this.dynamicData[stepId] = signal<Record<string, unknown>>({});
        });

        // Only access sessionStorage if we are in the browser
        if (isPlatformBrowser(this.platformId)) {
            this.loadFromStorage();

            // Effect to auto-save to sessionStorage whenever signals change
            effect(() => {
                sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.createSnapshot()));
            });
        }
    }

    /**
     * Creates a Memento (snapshot) of the current state.
     */
    createSnapshot(): BuilderSnapshot {
        const dynamicStateToSave: Record<string, Record<string, unknown>> = {};
        Object.keys(this.dynamicData).forEach((stepId) => {
            dynamicStateToSave[stepId] = this.dynamicData[stepId]();
        });

        return {
            description: this.descriptionData(),
            review: this.reviewData(),
            editedFiles: this.editedFiles(),
            ...dynamicStateToSave,
        };
    }

    /**
     * Restores the state from a given Memento (snapshot).
     */
    restoreSnapshot(snapshot: BuilderSnapshot): void {
        if (snapshot.description) this.descriptionData.set(snapshot.description);
        if (snapshot.review) this.reviewData.set(snapshot.review);
        if (snapshot.editedFiles) this.editedFiles.set(snapshot.editedFiles);

        Object.keys(this.dynamicData).forEach((stepId) => {
            if (snapshot[stepId]) {
                this.dynamicData[stepId].set(snapshot[stepId]);
            } else {
                this.dynamicData[stepId].set({}); // clear if not in preset
            }
        });
    }

    /**
     * Loads the initial state from sessionStorage
     */
    private loadFromStorage(): void {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as BuilderSnapshot;
                this.restoreSnapshot(parsed);
            } catch (e) {
                console.error('Failed to parse builder state from sessionStorage', e);
            }
        }
    }

    /**
     * Hard reset of all builder state by clearing storage and reloading
     */
    reset(): void {
        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.removeItem(this.STORAGE_KEY);
            // Hard reload to completely wipe form states and memory
            window.location.href = '/builder/description';
        }
    }
}
