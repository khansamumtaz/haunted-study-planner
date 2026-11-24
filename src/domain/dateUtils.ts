// Local-time date utilities for the Haunted Study Planner.
//
// Part of the pure domain layer (src/domain/*): pure transformations of Date
// values. No React, no `window` access for state, no `localStorage`, no I/O,
// no side effects. Using the `Date` constructor and Date instance methods is
// expected and fine — these are pure transformations of Date values.
//
// All date handling is LOCAL. `<input type="datetime-local">` yields
// "YYYY-MM-DDTHH:mm", parsed by `new Date(...)` as local time, so countdowns
// and calendar-day math reflect the student's own clock (Requirement 3.1).

/** Number of milliseconds in one 24-hour day.
 *
 * Centralized here so the calendar-day math used by the countdown lives in one
 * place; `countdown.ts` imports this rather than re-deriving it. */
export const DAY_MS: number = 24 * 60 * 60 * 1000

/**
 * The Date at local midnight (00:00:00.000) of the same calendar day as `d`.
 *
 * Uses LOCAL getters (`getFullYear`/`getMonth`/`getDate`) and constructs via the
 * local `Date` constructor `new Date(year, month, day, 0, 0, 0, 0)`, so the
 * result is the start of `d`'s calendar day in the student's timezone (NOT
 * UTC). Countdown day counts combine `startOfDay` with `Math.round` so a
 * 23- or 25-hour DST day still yields the correct integer day count
 * (Requirement 3.1, 3.2).
 */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/**
 * Parse a "YYYY-MM-DDTHH:mm" due-date string (from a `datetime-local` input)
 * into a local Date.
 *
 * `new Date(isoLocal)` parses this ISO-local form as local time, matching how
 * `datetime-local` inputs emit values, so the resulting Date reflects the
 * student's own clock (Requirement 3.1, 3.3).
 */
export function parseDueDate(isoLocal: string): Date {
  return new Date(isoLocal)
}

/**
 * Format a Date's local time of day as zero-padded 24-hour "HH:MM".
 *
 * Uses LOCAL `getHours`/`getMinutes` and zero-pads both fields to two digits
 * (e.g. "09:05"). Used for the same-day "Rises tonight at HH:MM" countdown
 * (Requirement 3.3).
 */
export function formatTime(d: Date): string {
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}
