// Assignment CRUD, validation, banish/restore, and subject autocomplete.
//
// Part of the pure domain layer (src/domain/*): no React, no `window`, no
// `localStorage`, no I/O, no side effects. Every function here is a pure
// reducer/validator that takes data in and returns data out without reading
// or writing external state. The only non-pure detail is id generation via
// `crypto.randomUUID()` and timestamping via `now.toISOString()` when a
// `Date` is supplied by the caller; both are standard value-producing APIs.
//
// This module is the target of property-based tests (Properties 1, 2, 3, 10).
//
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.6

import type { Assignment, AssignmentInput } from './types'

/**
 * Shape returned by {@link validateAssignment}. `errors` carries an optional
 * message keyed by the offending field (`title` and/or `dueDate`). A valid
 * input always yields `{ valid: true, errors: {} }`.
 */
export type ValidationResult = {
  valid: boolean
  errors: Partial<Record<'title' | 'dueDate', string>>
}

/**
 * Regex for the `datetime-local` due-date format `YYYY-MM-DDTHH:mm` — a full
 * calendar date AND a time of day, joined by `T`. Enforcing both halves is
 * Requirement 1.4 ("a complete Due_Date (date and time)").
 */
const DUE_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

/**
 * True iff `dueDate` is a complete `YYYY-MM-DDTHH:mm` string that also parses
 * to a real, non-NaN `Date`. The regex alone would accept impossible values
 * such as `2026-13-45T99:99`; the `Date` validity check rejects those, so
 * "both date and time present" is enforced genuinely (Req 1.4).
 */
function isValidDueDate(dueDate: string): boolean {
  if (!DUE_DATE_RE.test(dueDate)) return false
  return !Number.isNaN(new Date(dueDate).getTime())
}

/**
 * Validate an AssignmentInput before creating or saving.
 *
 * An input is valid iff `title.trim() !== ''` (Req 1.4) AND `dueDate` is a
 * complete `YYYY-MM-DDTHH:mm` string (Req 1.4). `subject` and `priority` never
 * affect validity. Invalid inputs are rejected with field-keyed messages
 * (Req 1.5); a valid input returns `{ valid: true, errors: {} }`.
 *
 * @returns `{ valid, errors }` where `errors` has optional `title`/`dueDate`.
 */
export function validateAssignment(input: AssignmentInput): ValidationResult {
  const errors: Partial<Record<'title' | 'dueDate', string>> = {}

  if (input.title.trim() === '') {
    errors.title = 'Title is required.'
  }
  if (!isValidDueDate(input.dueDate)) {
    errors.dueDate = 'A complete due date and time are required.'
  }

  const valid = errors.title === undefined && errors.dueDate === undefined
  return valid ? { valid: true, errors: {} } : { valid: false, errors }
}

/**
 * Create a single Assignment from user input (Req 1.1).
 *
 * - `id` is a fresh `crypto.randomUUID()` (stable identity across later edits,
 *   Req 1.2).
 * - `title` is trimmed (Req 1.4).
 * - `subject` is kept as-is; `""` is allowed (Req 1.7).
 * - `priority` defaults to `'medium'` when unset (Req 1.6).
 * - `completed` is `false`, `completedAt` is `null` (active on create, Req 2).
 *
 * This returns ONE assignment, not a collection; appending it to the
 * Spirit_Collection is the hook's job.
 */
export function createAssignment(input: AssignmentInput): Assignment {
  return {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    subject: input.subject,
    dueDate: input.dueDate,
    priority: input.priority ?? 'medium',
    completed: false,
    completedAt: null,
  }
}

/**
 * Update the assignment with `id` per `patch`, preserving its identity
 * (`id`), `completed`, and `completedAt` — none of which are part of
 * `AssignmentInput` (Req 1.2). Only the fields present in `patch` change;
 * `title` is trimmed when provided (Req 1.4). Returns a NEW array; the input
 * array and its assignment objects are never mutated. If `id` is not found,
 * the collection is returned unchanged.
 */
export function updateAssignment(
  c: Assignment[],
  id: string,
  patch: Partial<AssignmentInput>,
): Assignment[] {
  let found = false
  const next = c.map((a) => {
    if (a.id !== id) return a
    found = true
    const updated: Assignment = { ...a }
    if (patch.title !== undefined) updated.title = patch.title.trim()
    if (patch.subject !== undefined) updated.subject = patch.subject
    if (patch.dueDate !== undefined) updated.dueDate = patch.dueDate
    if (patch.priority !== undefined) updated.priority = patch.priority
    return updated
  })
  return found ? next : c
}

/**
 * Remove the assignment whose `id` matches (Req 1.3). Returns a NEW array; the
 * input array is never mutated. If `id` is not present, the collection is
 * returned unchanged.
 */
export function deleteAssignment(c: Assignment[], id: string): Assignment[] {
  if (!c.some((a) => a.id === id)) return c
  return c.filter((a) => a.id !== id)
}

/**
 * Banish the assignment with `id`: mark it completed and stamp `completedAt`
 * with `now.toISOString()` (Req 2.1). Returns a NEW array; inputs are never
 * mutated. If `id` is not found, the collection is returned unchanged.
 */
export function banish(c: Assignment[], id: string, now: Date): Assignment[] {
  let found = false
  const next = c.map((a) => {
    if (a.id !== id) return a
    found = true
    return { ...a, completed: true, completedAt: now.toISOString() }
  })
  return found ? next : c
}

/**
 * Restore a banished assignment: return it to active by setting
 * `completed` to `false` and `completedAt` to `null` (Req 2.6). Returns a NEW
 * array; inputs are never mutated. If `id` is not found, the collection is
 * returned unchanged.
 */
export function restore(c: Assignment[], id: string): Assignment[] {
  let found = false
  const next = c.map((a) => {
    if (a.id !== id) return a
    found = true
    return { ...a, completed: false, completedAt: null }
  })
  return found ? next : c
}

/**
 * Collect distinct, non-empty `subject` values for autocomplete (Req 1.7).
 *
 * Returns the subjects in the collection that are non-empty / not
 * whitespace-only AND contain `prefix` as a case-insensitive substring, with
 * duplicates removed and first-occurrence order preserved. An empty `prefix`
 * matches every non-empty subject (since every string contains `""`).
 */
export function collectSubjects(c: Assignment[], prefix: string): string[] {
  const lowerPrefix = prefix.toLowerCase()
  const seen = new Set<string>()
  const result: string[] = []
  for (const a of c) {
    const subject = a.subject
    if (subject.trim() === '') continue
    if (!subject.toLowerCase().includes(lowerPrefix)) continue
    if (seen.has(subject)) continue
    seen.add(subject)
    result.push(subject)
  }
  return result
}
