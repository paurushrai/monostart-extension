import { WidgetType } from './widgetCatalog';
import type { WidgetItem } from '../types';

/**
 * Pure, on-load normalization of persisted dashboard items: forward-migrations for
 * legacy shapes plus de-duplication. Extracted from useDashboard so the data-shape
 * rules live in one testable place, separate from the hook's stateful wiring.
 */

/** Google Search used to allow variable height; clamp legacy oversized rows to 1. */
export const migrateGoogleSearchHeight = (items: WidgetItem[]): WidgetItem[] =>
  items.map((l) =>
    l.type === WidgetType.GOOGLE_SEARCH && (l.h ?? 1) > 1 ? { ...l, h: 1 } : l,
  );

// Pre-1.0 the group widget's persisted discriminant was 'section'. Items saved
// before the rename still carry it and would fall through to the link renderer,
// so normalize them to the current 'group' type on load.
const LEGACY_SECTION_TYPE = 'section';

export const migrateLegacySectionType = (items: WidgetItem[]): WidgetItem[] =>
  items.map((item) =>
    (item.type as string) === LEGACY_SECTION_TYPE
      ? ({ ...item, type: WidgetType.GROUP } as WidgetItem)
      : item,
  );

/** Drop items sharing an id, keeping the first occurrence. */
export const dedupeById = (items: WidgetItem[]): WidgetItem[] => {
  const seen = new Set<string>();
  const out: WidgetItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
};

/** Full load-time pipeline: apply every migration, then de-duplicate. */
export const normalize = (items: WidgetItem[]): WidgetItem[] =>
  dedupeById(migrateGoogleSearchHeight(migrateLegacySectionType(items)));
