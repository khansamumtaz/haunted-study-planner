// Feature: haunted-study-planner, Property 7: Restless classification is exactly "due date is in the past"
//
// Validates: Requirements 3.4, 8.3
//
// For any uncompleted assignment and any `now`, the assignment is classified a
// restless ghost if and only if `parseDueDate(assignment.dueDate) < now`; and
// when it is, `formatCountdown(now, parseDueDate(assignment.dueDate))` returns
// "Restless". An uncompleted assignment whose due date is not in the past is
// never classified restless.
//
// The domain stores due dates as ISO-local "YYYY-MM-DDTHH:mm" (minute
// precision). `parseDueDate` re-parses that string as a local Date, which
// truncates any seconds/milliseconds. To stay consistent with the domain's own
// contract, every assertion anchors on `parseDueDate(a.dueDate)` rather than
// the raw generator Date, and derives `now` from that parsed value. This makes
// the iff provable per run: Direction A forces `now` strictly after the parsed
// due (due in the past), Direction B forces `now` at or before the parsed due
// (due not in the past, including the equal-timestamp boundary).

import { it, fc } from '@fast-check/vitest'
import { isRestlessGhost } from './restless'
import { formatCountdown } from './countdown'
import { parseDueDate } from './dateUtils'
import type { Assignment } from './types'

/** One 24-hour day in milliseconds (mirrors dateUtils.DAY_MS for offset math). */
const DAY_MS = 24 * 60 * 60 * 1000

/** Realistic assignment-due range; keeps the formatted year at four digits. */
const MIN_DUE = new Date(2001, 0, 1, 0, 0, 0, 0)
const MAX_DUE = new Date(2099, 11, 31, 23, 59, 0, 0)

/**
 * Format a Date's local wall-clock as the ISO-local "YYYY-MM-DDTHH:mm" string a
 * `datetime-local` input emits, mirroring how an Assignment.dueDate is stored.
 * Uses LOCAL getters throughout so the string reflects the student's clock.
 */
function toIsoLocal(d: Date): string {
  const y = d.getFullYear().toString().padStart(4, '0')
  const mo = (d.getMonth() + 1).toString().padStart(2, '0')
  const da = d.getDate().toString().padStart(2, '0')
  const h = d.getHours().toString().padStart(2, '0')
  const mi = d.getMinutes().toString().padStart(2, '0')
  return `${y}-${mo}-${da}T${h}:${mi}`
}

/**
 * Arbitrary uncompleted Assignment. `completed` is pinned to `false` so the
 * `!a.completed` guard in `isRestlessGhost` never short-circuits the date test;
 * the other fields are arbitrary but irrelevant to classification.
 */
const uncompletedAssignment: fc.Arbitrary<Assignment> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1 }),
  subject: fc.string(),
  dueDate: fc.date({ min: MIN_DUE, max: MAX_DUE }).map(toIsoLocal),
  priority: fc.constantFrom('low', 'medium', 'high'),
  completed: fc.constant(false),
  completedAt: fc.constant<Assignment['completedAt']>(null),
})

/**
 * Offset (ms) added to the parsed due to land `now` strictly AFTER it.
 * Spans both Requirement 3.4 sub-cases:
 *  - small: "the current day with a time that has already passed"
 *  - large: "an earlier calendar day"
 */
const pastOffsetMs = fc.oneof(
  fc.integer({ min: 1, max: 59_999 }), // seconds past, same calendar day
  fc.integer({ min: 60_000, max: DAY_MS - 1 }), // hours past, same calendar day
  fc.integer({ min: DAY_MS, max: 365 * DAY_MS }), // one or more earlier calendar days
)

/**
 * Offset (ms) subtracted from the parsed due to land `now` AT or BEFORE it.
 * Covers the equal-timestamp boundary (`0`) and the "not yet due" cases:
 *  - same calendar day with a time that has not yet passed
 *  - a future calendar day
 */
const notPastOffsetMs = fc.oneof(
  fc.constant(0), // boundary: now === parsedDue (strict "<" must be false)
  fc.integer({ min: 1, max: DAY_MS - 1 }), // same calendar day, time not yet passed
  fc.integer({ min: DAY_MS, max: 365 * DAY_MS }), // one or more future calendar days
)

describe('Property 7: Restless classification is exactly "due date is in the past"', () => {
  // Direction A — due date is in the past => restless AND "Restless" countdown.
  // Validates: Requirements 3.4, 8.3
  it.prop([uncompletedAssignment, pastOffsetMs], { numRuns: 100 })(
    'direction A: when parseDueDate(dueDate) < now then isRestlessGhost is true and formatCountdown is "Restless"',
    (a, offset) => {
      const due = parseDueDate(a.dueDate)
      const now = new Date(due.getTime() + offset)

      // Precondition: the offset guarantees `due` is strictly in the past.
      expect(due.getTime()).toBeLessThan(now.getTime())

      // Contract: an uncompleted past-due assignment is a restless ghost...
      expect(isRestlessGhost(a, now)).toBe(true)
      // ...and its countdown reads exactly "Restless".
      expect(formatCountdown(now, due)).toBe('Restless')
    },
  )

  // Direction B — due date is NOT in the past => never restless.
  // Validates: Requirements 3.4, 8.3
  it.prop([uncompletedAssignment, notPastOffsetMs], { numRuns: 100 })(
    'direction B: when parseDueDate(dueDate) >= now then isRestlessGhost is false',
    (a, offset) => {
      const due = parseDueDate(a.dueDate)
      const now = new Date(due.getTime() - offset)

      // Precondition: the offset guarantees `now` is at or before `due`.
      expect(now.getTime()).toBeLessThanOrEqual(due.getTime())

      // Contract: an uncompleted assignment that is not yet past due is never
      // classified restless (covers the equal-timestamp boundary too).
      expect(isRestlessGhost(a, now)).toBe(false)
    },
  )
})
