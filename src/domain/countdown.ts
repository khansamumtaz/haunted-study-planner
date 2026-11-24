// Spooky deadline-countdown helpers for the Haunted Study Planner.
//
// Part of the pure domain layer (src/domain/*): pure transformations of Date
// values. No React, no `window`, no `localStorage`, no I/O, no side effects.
// This module encodes the Deadline_Countdown and Restless_Ghost classification
// rules (Requirement 3) and is a target of property-based tests.
//
// All date handling is LOCAL. Calendar-day counts use `startOfDay` + `Math.round`
// so a 23- or 25-hour DST day still yields the correct integer day count
// (Requirement 3.1, 3.6).

import { DAY_MS, startOfDay, formatTime } from './dateUtils'

/**
 * Number of calendar-day boundaries crossed from `startOfDay(now)` to
 * `startOfDay(due)`.
 *
 * Uses `Math.round` on the local-midnight difference divided by `DAY_MS` so the
 * result is a whole calendar-day count that survives DST transitions (a 23- or
 * 25-hour day still counts as one boundary) (Requirement 3.1, 3.6).
 *
 * - `due` on a future calendar day → positive integer (1, 2, 3, ...)
 * - `due` on the same calendar day as `now` → 0
 * - `due` on a past calendar day → negative integer
 */
export function calendarDaysBetween(now: Date, due: Date): number {
  return Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / DAY_MS,
  )
}

/**
 * Returns `true` iff the due date-time is strictly in the past relative to
 * `now` (`due.getTime() < now.getTime()`).
 *
 * Both "an earlier calendar day" and "the current day with a time that has
 * already passed" reduce to this single timestamp test, which is exactly
 * Requirement 8.3's "earlier than the current date and time" (Requirement 3.4,
 * 8.3).
 */
export function isRestless(due: Date, now: Date): boolean {
  return due.getTime() < now.getTime()
}

/**
 * Formats the Halloween-themed Deadline_Countdown for an uncompleted
 * assignment given the current date-time `now` and the `due` date-time
 * (Requirement 3.1–3.4, 3.6).
 *
 * Decision logic:
 * 1. If the due date-time is in the past (`isRestless(due, now)`), return
 *    `"Restless"` (Requirement 3.4).
 * 2. Otherwise compute the calendar-day count `days`:
 *    - `days > 1` → `"Rises in N days"` (e.g. "Rises in 2 days")
 *      (Requirement 3.2, 3.6).
 *    - `days === 1` → `"Rises in 1 day"` (singular) (Requirement 3.2).
 *    - `days === 0` → due is the same calendar day and the time has not yet
 *      passed (it is not restless), so return `"Rises tonight at HH:MM"`
 *      using the local `formatTime(due)` (e.g. "Rises tonight at 14:30")
 *      (Requirement 3.3).
 *    - A negative `days` cannot occur here once `isRestless` is checked, but
 *      is treated as `"Restless"` as a defensive safety net.
 */
export function formatCountdown(now: Date, due: Date): string {
  if (isRestless(due, now)) {
    return 'Restless'
  }

  const days = calendarDaysBetween(now, due)

  if (days > 1) {
    return `Rises in ${days} days`
  }
  if (days === 1) {
    return 'Rises in 1 day'
  }
  if (days === 0) {
    return `Rises tonight at ${formatTime(due)}`
  }

  // Defensive: a negative day count should be unreachable once isRestless is
  // checked, but treat it as restless to never render a misleading countdown.
  return 'Restless'
}
