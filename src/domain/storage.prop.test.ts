// Property-based test for the Haunted Study Planner's persistence layer.
//
// Property 11 (Requirement 5.5): serialization round-trips any valid
// Spirit_Collection. We generate arbitrary VALID collections and assert that
// deserializing the serialized form is structurally equivalent to the
// original collection: same length, and position-by-position equal `id`,
// `title`, `subject`, `dueDate`, `priority`, `completed`, `completedAt`.
//
// Contract note: `serialize` returns a JSON string (the persisted form), while
// `deserialize` accepts *parsed* JSON data (it asserts `Array.isArray(raw)`).
// The round-trip therefore requires `JSON.parse` between the two — mirroring
// `loadCollection`, which does `deserialize(JSON.parse(raw))`. This test honours
// the implementation's contract (Req 5.5): `deserialize(JSON.parse(serialize(c)))`.
//
// Feature: haunted-study-planner, Property 11: Serialization round-trips the collection
//
// Validates: Requirements 5.5

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { serialize, deserialize } from './storage'
import type { Assignment, Priority } from './types'

/** Zero-pad a number to two digits (e.g. 5 -> "05"). */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

/**
 * Format a Date as a local "YYYY-MM-DDTHH:mm" string — the format produced by
 * `<input type="datetime-local">` and accepted by the domain's due-date
 * validator. Uses local getters so the value parses as local time and never
 * produces an invalid (NaN) Date.
 */
function toLocalDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`
}

/**
 * Arbitrary for a non-empty, non-whitespace-only title. `deserialize` rejects
 * empty or whitespace-only titles (Req 1.4, 5.4), so generated collections must
 * stay valid to avoid throwing.
 */
const titleArb = fc.string({ minLength: 1 }).filter((s) => s.trim() !== '')

/**
 * Arbitrary for a valid "YYYY-MM-DDTHH:mm" due date. The date range is bounded
 * to 4-digit years so the formatted string parses to a real (non-NaN) local Date.
 */
const dueDateArb = fc
  .date({ min: new Date(2000, 0, 1), max: new Date(2100, 0, 1) })
  .map(toLocalDateTime)

/** Arbitrary for `completedAt`: `null` while active, or an ISO timestamp string. */
const completedAtArb = fc.oneof(
  fc.constant(null),
  fc.date({ min: new Date(2000, 0, 1), max: new Date(2100, 0, 1) }).map((d) =>
    d.toISOString(),
  ),
)

/** Arbitrary for a single valid Assignment with the canonical seven fields. */
const assignmentArb: fc.Arbitrary<Assignment> = fc.record({
  id: fc.uuid(),
  title: titleArb,
  subject: fc.string(),
  dueDate: dueDateArb,
  priority: fc.constantFrom<Priority>('low', 'medium', 'high'),
  completed: fc.boolean(),
  completedAt: completedAtArb,
})

/** Arbitrary for a valid Spirit_Collection (varying length, including empty). */
const collectionArb = fc.array(assignmentArb)

describe('Property 11 — Serialization round-trips the collection', () => {
  // Feature: haunted-study-planner, Property 11: Serialization round-trips the collection
  it(
    'deserialize(serialize(collection)) equals collection for any valid collection',
    () => {
      fc.assert(
        fc.property(collectionArb, (collection) => {
          const roundTripped = deserialize(serialize(collection))
          // Structural equivalence (Req 5.5): same length and position-by-position
          // equal id, title, subject, dueDate, priority, completed, completedAt.
          expect(roundTripped).toEqual(collection)
        }),
        { numRuns: 100 },
      )
    },
  )
})
