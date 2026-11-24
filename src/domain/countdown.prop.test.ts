// Feature: haunted-study-planner, Property 5: Future-day countdown day count matches an independent day counter
// Validates: Requirements 3.2, 3.6
//
// For any `now` and any due date on a future calendar day, formatCountdown(now,
// due) returns "Rises in N days" (or "Rises in 1 day" when N === 1), where N
// equals the number of calendar-day boundaries crossed from startOfDay(now) to
// startOfDay(due) as computed by an INDEPENDENT reference counter that steps a
// cursor forward one local calendar day at a time (NOT the
// `Math.round((startOfDay(due) - startOfDay(now)) / DAY_MS)` formula that
// `calendarDaysBetween` uses).

import * as fc from 'fast-check'
import { formatCountdown, calendarDaysBetween } from './countdown'
import { startOfDay } from './dateUtils'

/**
 * Independent reference oracle for the calendar-day count N.
 *
 * Counts the calendar-day boundaries crossed from `startOfDay(now)` to
 * `startOfDay(due)` by walking a cursor forward one local calendar day at a
 * time via the Date constructor (`new Date(y, m, d + 1)`), which normalizes
 * month/year overflow and lands on the next calendar day's local midnight even
 * across 23- or 25-hour DST days.
 *
 * This deliberately does NOT use the `Math.round((diff) / DAY_MS)` arithmetic
 * that `calendarDaysBetween` uses; it derives N purely by counting calendar-day
 * steps, so it is a genuine independent oracle for Requirement 3.2 / 3.6.
 *
 * Precondition: `due` is on a strictly future calendar day
 * (`startOfDay(due) > startOfDay(now)`), so the loop always terminates. The
 * generated offset is bounded (1..365), capping the iteration count.
 */
function referenceDayCount(now: Date, due: Date): number {
  const target = startOfDay(due).getTime()
  let cursor = startOfDay(now)
  let count = 0
  // Bounded by the generated offset (1..365); a safety cap guards against any
  // construction anomaly so a runaway loop can never hang the test.
  while (cursor.getTime() < target && count <= 100000) {
    cursor = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate() + 1,
    )
    count += 1
  }
  return count
}

// Feature: haunted-study-planner, Property 5: Future-day countdown day count matches an independent day counter
describe('Property 5: Future-day countdown day count matches an independent day counter', () => {
  it('returns "Rises in N days" / "Rises in 1 day" with N from an independent day-stepping oracle', () => {
    fc.assert(
      fc.property(
        // `now` varied across realistic modern local dates (and thus times of
        // day); constrained to a sane range so DST rules are well-defined.
        fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 11, 31) }),
        // Positive day offset: `due` lands on a strictly future calendar day
        // (N >= 1), so the countdown is never "Rises tonight" or "Restless".
        fc.integer({ min: 1, max: 365 }),
        // Vary the due date's time of day: the day count must depend only on
        // calendar days, not on the time of day (Requirement 3.6).
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 }),
        (now, offset, dueHour, dueMinute) => {
          // Construct `due` on the calendar day `offset` days after `now`'s
          // calendar day, at an arbitrary local time of day. The local Date
          // constructor normalizes month/year overflow and handles DST, so this
          // always lands on the intended future calendar day.
          const due = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + offset,
            dueHour,
            dueMinute,
            0,
            0,
          )

          // Precondition: due is on a strictly future calendar day. A future
          // calendar day is automatically not restless (its earliest instant
          // is after any instant of `now`'s own day), so formatCountdown takes
          // the "Rises in N days" / "Rises in 1 day" branch.
          expect(startOfDay(due).getTime()).toBeGreaterThan(
            startOfDay(now).getTime(),
          )

          const n = referenceDayCount(now, due)
          const expected = n === 1 ? 'Rises in 1 day' : `Rises in ${n} days`

          // Requirement 3.6: the displayed day count N equals the number of
          // calendar days between the current date and the Due_Date.
          expect(calendarDaysBetween(now, due)).toBe(n)
          // Requirement 3.2: a future-calendar-day Due_Date displays
          // "Rises in N days" (singular "Rises in 1 day" when N === 1).
          expect(formatCountdown(now, due)).toBe(expected)
        },
      ),
      { numRuns: 100 },
    )
  })
})
