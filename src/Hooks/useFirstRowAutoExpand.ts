import React, { useState } from 'react';

type RowId = string | number;

const STORAGE_PREFIX = 'rt-discovery:';

/** True when the user has already toggled a row for this discovery key (storage errors count as "no"). */
export function hasDiscoveryFlag(storageKey?: string): boolean {
  if (!storageKey || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + storageKey) !== null;
  } catch {
    return false;
  }
}

/** Remember that the user has discovered expand/collapse for this key. Never throws. */
export function markDiscovered(storageKey?: string): void {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + storageKey, '1');
  } catch {
    /* storage unavailable (private mode, quota) — discovery simply repeats next visit */
  }
}

/** Id of the first row whose renderer returns non-null content, or undefined. */
export function findFirstExpandableRowId<TData>(
  rows: TData[],
  expandRowRenderer: (row: TData, rowIndex: number) => React.ReactNode,
  getRowId: (row: TData, index: number) => RowId,
): RowId | undefined {
  for (let i = 0; i < rows.length; i++) {
    if (expandRowRenderer(rows[i], i) != null) return getRowId(rows[i], i);
  }
  return undefined;
}

interface Options<TData> {
  enabled: boolean;
  rows: TData[];
  expandRowRenderer?: (row: TData, rowIndex: number) => React.ReactNode;
  getRowId: (row: TData, index: number) => RowId;
  storageKey?: string;
  setExpandedIds: React.Dispatch<React.SetStateAction<Set<RowId>>>;
}

/**
 * Opens the first expandable row exactly once, the first time rows exist.
 *
 * The state update happens during render (not in an effect) so React re-renders before the first
 * paint: the row is already expanded when the user first sees it, with no opening animation.
 * After that single application it never runs again, so user collapses, sorts, filters and data
 * refreshes are never fought.
 */
export function useFirstRowAutoExpand<TData>({
  enabled,
  rows,
  expandRowRenderer,
  getRowId,
  storageKey,
  setExpandedIds,
}: Options<TData>): void {
  const [applied, setApplied] = useState(false);

  if (!enabled || applied || !expandRowRenderer || rows.length === 0) return;

  setApplied(true);
  if (hasDiscoveryFlag(storageKey)) return;

  const id = findFirstExpandableRowId(rows, expandRowRenderer, getRowId);
  if (id !== undefined) {
    setExpandedIds(prev => new Set(prev).add(id));
  }
}
