// Restless-ghost classification for the Haunted Study Planner.
//
// Part of the pure domain layer (src/domain/*): no React, no `window`, no
// `localStorage`, no I/O, no side effects. The single function here is a pure
// predicate over an Assignment and the current time. It delegates the
// due-date parsing to `dateUtils.ts` (so the local-time semantics of
// Requirement 3.1 are shared with the rest of the countdown logic) and the
// timestamp comparison to `countdown.ts`.
//
// This module is the target of property-based tests (Property 7).
//
// Requirements: 3.4, 3.5, 8.3

import type { Assignment } from './types'
import { isRestless } from './countdown'
import { parseDueDate } from './dateUtils'

/**
 * Classify an Assignment as a Restless_Ghost (Requirements 3.4, 8.3).
 *
 * Returns `true` if and only if the assignment is uncompleted
 * (`!a.completed`) AND its Due_Date is strictly earlier than `now`
 * (`isRestless(parseDueDate(a.dueDate), now)`). Both "an earlier calendar
 * day" and "the current day with a time that has already passed" reduce to
 * this single timestamp test, which is exactly Requirement 8.3's "earlier
 * than the current date and time".
 *
 * Completed (banished) assignments are never restless, so a spirit that has
 * been banished stays in the Banished_Section regardless of its Due_Date
 * (Requirements 3.4, 3.5).
 *
 * `now` is supplied by the caller (the `useNow` hook) rather than read here,
 * keeping the function pure and the periodic re-evaluation (Requirement 8.2)
 * driven from the view layer.
 */
export function isRestlessGhost(a: Assignment, now: Date): boolean {
  return !a.completed && isRestless(parseDueDate(a.dueDate), now)
}
