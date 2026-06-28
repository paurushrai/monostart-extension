import { createContext, useContext } from 'react';
import type { WidgetItem, GridSlot } from '../types';

/**
 * The dashboard's item-mutation callbacks, shared via context so they don't have
 * to be drilled App → DashboardGrid → WidgetRenderer → widget. The provided value
 * MUST be referentially stable (memoized over stable handlers) so consuming
 * widgets don't re-render on every parent render.
 */
export interface DashboardActions {
  onDelete: (id: string) => void;
  onViewModeChange: (id: string, newMode: 'icon' | 'icon+text') => void;
  onUpdateItem: (id: string, updates: Partial<WidgetItem>) => void;
  onMoveItem: (linkId: string, targetGroupId: string | null | undefined, targetCoords?: GridSlot) => void;
}

const DashboardActionsContext = createContext<DashboardActions | null>(null);

export const DashboardActionsProvider = DashboardActionsContext.Provider;

export function useDashboardActions(): DashboardActions {
  const ctx = useContext(DashboardActionsContext);
  if (!ctx) {
    throw new Error('useDashboardActions must be used within a DashboardActionsProvider');
  }
  return ctx;
}
