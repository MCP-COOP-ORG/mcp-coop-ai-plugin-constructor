import {
    Component,
    input,
    signal,
    viewChild,
    viewChildren,
    ElementRef,
    contentChild,
    TemplateRef,
    computed,
    afterNextRender,
    effect,
    ChangeDetectionStrategy,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TuiTabs } from '@taiga-ui/kit';
import { BUILDER_DICTIONARY } from '@shared/constants';
import { BuilderStep, BuilderBlockConfig } from '@shared/models';
import { TuiTextfield, TuiInput } from '@taiga-ui/core';
import { StepHeader } from '../step-header/step-header';
import { BuilderBlock } from '../builder-block/builder-block';

/**
 * Universal layout component for Builder steps.
 * Handles the 2-column grid layout, ScrollSpy navigation, and block rendering.
 * It is a Dumb component that relies purely on input signals.
 */
@Component({
    selector: 'app-step-layout',
    imports: [StepHeader, BuilderBlock, TuiTabs, NgTemplateOutlet, TuiTextfield, TuiInput],
    templateUrl: './step-layout.html',
    styleUrl: './step-layout.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepLayout {
    /** The view model containing dictionary labels for strict zero-literals compliance */
    readonly view = {
        labels: BUILDER_DICTIONARY.labels,
        sidebar: BUILDER_DICTIONARY.sidebar,
        limits: BUILDER_DICTIONARY.limits,
    };

    /** The step configuration (title, description, icon) */
    step = input.required<BuilderStep>();

    /** The array of blocks to render in the layout */
    blocks = input.required<BuilderBlockConfig[]>();

    /** The projected template from the parent containing specific block controls */
    contentTemplate = contentChild<TemplateRef<{ $implicit: BuilderBlockConfig }>>(TemplateRef);

    /** Query for all rendered block wrapper elements to track scroll position */
    blockElements = viewChildren<ElementRef>('blockElement');

    /** Query for all rendered tab elements in the sidebar */
    tabElements = viewChildren<ElementRef>('tabElement');

    /** Reference to the scrollable sticky nav container */
    navContainer = viewChild<ElementRef>('navContainer');

    /** Tracks the currently active tab index for the right-hand sidebar */
    activeTabIndex = signal(0);

    /** Signal for the search input in the sidebar */
    searchQuery = signal<string>('');

    /** Computed view model for the sidebar tabs based on the blocks input */
    tabs = computed(() => {
        return this.blocks().map((block) => ({
            id: block.id,
            label: block.title,
        }));
    });

    /** Computed view model for the filtered tabs based on search */
    filteredTabs = computed(() => {
        const s = this.searchQuery().toLowerCase();
        const all = this.tabs();

        const minLength = BUILDER_DICTIONARY.limits.dropdownSearchMinLength;

        if (s.length >= minLength) {
            return all.filter((t) => t.label.toLowerCase().includes(s));
        }
        return all;
    });

    onSearch(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        this.searchQuery.set(inputElement.value);
    }

    constructor() {
        // Synchronize sidebar scrolling whenever the active tab index changes
        effect(() => {
            const index = this.activeTabIndex();
            // We must use setTimeout to ensure the DOM is fully rendered after the signal updates
            setTimeout(() => {
                const tabEl = this.tabElements()[index]?.nativeElement;
                const navEl = this.navContainer()?.nativeElement;

                if (tabEl && navEl) {
                    const tabRect = tabEl.getBoundingClientRect();
                    const navRect = navEl.getBoundingClientRect();

                    // Scroll the sidebar internally if the tab is outside its visible bounds
                    if (tabRect.bottom > navRect.bottom) {
                        navEl.scrollBy({ top: tabRect.bottom - navRect.bottom + 16, behavior: 'smooth' });
                    } else if (tabRect.top < navRect.top) {
                        navEl.scrollBy({ top: tabRect.top - navRect.top - 16, behavior: 'smooth' });
                    }
                }
            });
        });

        // We use afterNextRender to safely access the DOM for IntersectionObserver
        // This is the Angular Best Practice for DOM APIs, avoiding SSR/SSG issues.
        afterNextRender({
            read: () => this.setupScrollSpy(),
        });
    }

    private isProgrammaticScroll = false;
    private scrollTimeout: ReturnType<typeof setTimeout> | undefined;

    /**
     * Programmatically scrolls the window to a specific block when a sidebar tab is clicked.
     * @param filteredIndex The index of the block in the filteredTabs array
     */
    scrollToBlock(filteredIndex: number) {
        this.isProgrammaticScroll = true;
        clearTimeout(this.scrollTimeout);

        this.activeTabIndex.set(filteredIndex);
        const tab = this.filteredTabs()[filteredIndex];
        if (!tab) return;

        // Find the original index in the blocks array using the ID
        const originalIndex = this.blocks().findIndex((b) => b.id === tab.id);
        const element = this.blockElements()[originalIndex]?.nativeElement;
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Smooth scroll usually takes ~500-800ms. We lock the observer for 1s.
        this.scrollTimeout = setTimeout(() => {
            this.isProgrammaticScroll = false;
        }, BUILDER_DICTIONARY.timeouts.scrollLockMs);
    }

    /**
     * Initializes the IntersectionObserver to track which block is currently in the viewport.
     * Updates the activeTabIndex signal accordingly.
     */
    private setupScrollSpy() {
        if (typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (this.isProgrammaticScroll) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        const index = this.filteredTabs().findIndex((t) => t.id === id);
                        if (index !== -1) {
                            this.activeTabIndex.set(index);
                        }
                    }
                });
            },
            { rootMargin: '-20% 0px -80% 0px' },
        );

        // Iterate over the signal array directly
        this.blockElements().forEach((el) => observer.observe(el.nativeElement));
    }
}
