// Priority display and ranking helpers for the Haunted Study Planner.
//
// This module is part of the pure domain layer (src/domain/*): it holds no
// React, no `window`, no `localStorage`, and no I/O. It only encodes the
// business rules for Priority and is a target of property-based tests.

import type { Priority } from './types'

/**
 * Themed display names for each Priority (Requirement 1.8):
 * "Faint" for Low, "Haunting" for Medium, "Terrifying" for High.
 */
export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Faint',
  medium: 'Haunting',
  high: 'Terrifying',
}

/**
 * Numeric rank used to break ties by highest priority in `dashboard.ts`
 * (higher rank = higher priority): low=1, medium=2, high=3.
 */
const PRIORITY_RANK: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

/**
 * Returns the themed display name for a Priority (Requirement 1.8):
 * "Faint" for `'low'`, "Haunting" for `'medium'`, "Terrifying" for `'high'`.
 */
export function priorityLabel(p: Priority): string {
  return PRIORITY_LABEL[p]
}

/**
 * Returns the numeric rank of a Priority for tie-breaking in most-urgent
 * selection (higher rank = higher priority): low=1, medium=2, high=3.
 */
export function priorityRank(p: Priority): number {
  return PRIORITY_RANK[p]
}
