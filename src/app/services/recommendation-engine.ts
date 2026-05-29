import { Injectable, computed, inject } from '@angular/core';
import { GENERATED_PAGES_CONFIG } from '@shared/configs';
import { ConfigItem, RecommendationStatus } from '@shared/models';
import { isStringArray } from '@shared/utils';
import { BuilderState } from './builder-state';

/**
 * Computes recommendation/discouraged status for all ConfigItems
 * across all builder pages. Discouraged always wins over recommended.
 */
@Injectable({ providedIn: 'root' })
export class RecommendationEngine {
    private readonly builderState = inject(BuilderState);

    /** Flat registry of all ConfigItems indexed by ID. */
    private readonly allItems: ReadonlyMap<string, ConfigItem> = Object.values(GENERATED_PAGES_CONFIG)
        .flatMap((page) => page.categories)
        .flatMap((cat) => cat.items)
        .reduce((map, item) => map.set(item.id, item), new Map<string, ConfigItem>());

    /** Reactive map of item ID → status. Only non-neutral items are present. */
    readonly statusMap = computed<ReadonlyMap<string, RecommendationStatus>>(() => {
        const selected = this.collectSelectedIds();
        const recommended = new Set<string>();
        const discouraged = new Set<string>();

        for (const id of selected) {
            const item = this.allItems.get(id);
            item?.recommendedWith?.forEach((r) => recommended.add(r));
            item?.discouragedWith?.forEach((d) => discouraged.add(d));
        }

        return [...this.allItems.keys()]
            .filter((id) => !selected.has(id))
            .reduce((map, id) => {
                if (discouraged.has(id)) map.set(id, 'discouraged');
                else if (recommended.has(id)) map.set(id, 'recommended');
                return map;
            }, new Map<string, RecommendationStatus>());
    });

    /** Get status for a single item. */
    getStatus(itemId: string): RecommendationStatus | undefined {
        return this.statusMap().get(itemId);
    }

    /** Collects all selected checkbox IDs from all dynamic pages. */
    private collectSelectedIds(): Set<string> {
        return Object.values(this.builderState.dynamicData)
            .map((signal) => signal())
            .flatMap((data) => Object.values(data))
            .filter(isStringArray)
            .reduce((set, ids) => {
                ids.forEach((id) => set.add(id));
                return set;
            }, new Set<string>());
    }
}
