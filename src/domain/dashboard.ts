// Dashboard summary helpers for the Haunted Study Planner (Requirement 4).
//
// Part of the pure domain layer (src/domain/*): no React, no `window`, no
// `localStorage`, no I/O, no side effects. Every function here is pure — data
// in, data out, no mutation of inputs. This module is a target of
// property-based tests (Properties 8 and 9).
//
// Requirements: 4.1, 4.2, 4.3, 4.4

import type { Assignment } from './types'
import { priorityRank } from './priority'

/**
 * Number of Banished_Spirits in `c` — assignments whose `completed` field is
 * `true` (Requirement 4.1). Pure: returns a count and never mutates `c`.
 */
export function countBanished(c: Assignment[]): number {
  return c.filter((a) => a.completed).length
}

/**
 * Number of remaining (active, uncompleted) Spirits in `c` — assignments
 * whose `completed` field is `false` (Requirement 4.1). Together with
 * {@link countBanished} this partitions the collection: their sum equals
 * `c.length` (Property 8). Pure: returns a count and never mutates `c`.
 */
export function countRemaining(c: Assignment[]): number {
  return c.filter((a) => !a.completed).length
}

/**
 * Select the Most_Urgent_Spirit: the uncompleted assignment with the earliest
 * Due_Date, with ties broken by the highest Priority (Requirement 4.2, 4.3).
 * Returns `null` when no uncompleted assignments remain (Requirement 4.4).
 *
 * Selection minimizes the lexicographic key `(dueDate, -priorityRank)` over the
 * uncompleted assignments:
 *  - The earliest `dueDate` wins. `dueDate` is an ISO local "YYYY-MM-DDTHH:mm"
 *    string (from a `datetime-local` input), which sorts chronologically as
 *    plain text, so a string comparison finds the earliest date-time.
 *  - Ties (identical `dueDate`) are broken by highest priority: the key uses
 *    `-priorityRank`, so a higher `priorityRank` (high=3 > medium=2 > low=1)
 *    yields a smaller (more negative) value and sorts first.
 *
 * `now` is accepted for API consistency with the hooks/view layer (the
 * Dashboard renders the most-urgent spirit's Deadline_Countdown using `now`),
 * but selection is based on `dueDate` and `priority` alone — an overdue
 * uncompleted assignment is still the most urgent and is never excluded.
 */
export function selectMostUrgent(c: Assignment[], now: Date): Assignment | null {
  // `now` is intentionally unused by the selection logic (see JSDoc); it is
  // referenced here to satisfy `noUnusedParameters` while preserving the design
  // signature for API consistency.
  void now

  let best: Assignment | null = null
  for (const a of c) {
    if (a.completed) continue
    if (best === null || compareMostUrgentKey(a, best) < 0) {
      best = a
    }
  }
  return best
}

/**
 * Compare two assignments by the most-urgent key `(dueDate, -priorityRank)`:
 * returns a negative number when `a` is more urgent than `b`, a positive
 * number when `b` is more urgent, and `0` when they are tied (same `dueDate`
 * and same `priority`). The "most urgent" assignment is the one that minimizes
 * this key.
 *
 * A stable result on full ties (returning `0`) lets the caller keep the
 * first-encountered assignment, so the selection is deterministic for the
 * fully-tied case that the spec leaves unspecified.
 */
function compareMostUrgentKey(a: Assignment, b: Assignment): number {
  if (a.dueDate !== b.dueDate) {
    return a.dueDate < b.dueDate ? -1 : 1
  }
  // Same dueDate: a higher priorityRank is more urgent (min key = -priorityRank).
  const ra = priorityRank(a.priority)
  const rb = priorityRank(b.priority)
  if (ra === rb) return 0
  return ra > rb ? -1 : 1
}
