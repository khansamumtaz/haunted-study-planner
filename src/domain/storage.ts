// Persistence for the Haunted Study Planner's Spirit_Collection (Requirement 5).
//
// This module is part of the pure domain layer (src/domain/*). The serialization
// logic (`serialize` / `deserialize`) is pure: data in, data out, no I/O. The
// I/O functions (`loadCollection` / `saveCollection`) do NOT reach for a global
// `localStorage`; instead they accept a `Storage` instance as an argument, so
// the domain layer stays testable and free of `window` references. There is no
// React here. `STORAGE_KEY` is imported from `./types` (not redefined) so the
// persisted-key contract has a single source of truth.

import { STORAGE_KEY, type Assignment, type Priority, type SpiritCollection } from './types'

/** The only `priority` values a persisted assignment may carry. */
const VALID_PRIORITIES: ReadonlySet<Priority> = new Set<Priority>(['low', 'medium', 'high'])

/**
 * Serialize a Spirit_Collection to a stable JSON string (Req 5.1).
 *
 * Each assignment is emitted with its fields in a fixed order
 * (`id`, `title`, `subject`, `dueDate`, `priority`, `completed`, `completedAt`)
 * so that a round-trip through `deserialize` yields an equivalent collection
 * (Req 5.5) and a byte-identical JSON string. Pure: no I/O.
 *
 * @param c the Spirit_Collection to serialize.
 * @returns a JSON string of the normalized collection.
 */
export function serialize(c: Assignment[]): string {
  const normalized: SpiritCollection = c.map((a) => ({
    id: a.id,
    title: a.title,
    subject: a.subject,
    dueDate: a.dueDate,
    priority: a.priority,
    completed: a.completed,
    completedAt: a.completedAt,
  }))
  return JSON.stringify(normalized)
}

/**
 * Validate and reconstruct a Spirit_Collection from parsed JSON data (Req 5.2).
 *
 * `raw` must be an array whose every element is an object carrying the seven
 * required fields with the correct types: `id`, `title`, `subject`, and
 * `dueDate` are strings; `priority` is one of `'low' | 'medium' | 'high'`;
 * `completed` is a boolean; and `completedAt` is a string or `null`. `title`
 * must be non-empty (Req 1.4). Any non-array input, missing field, wrong-typed
 * field, or empty title causes this function to throw; `loadCollection` turns
 * that throw into an empty collection (Req 5.4). Pure: no I/O.
 *
 * @param raw the parsed JSON value to validate.
 * @returns the reconstructed Spirit_Collection.
 * @throws Error when `raw` is not an array or any element is invalid.
 */
export function deserialize(raw: unknown): Assignment[] {
  if (!Array.isArray(raw)) {
    throw new Error('Invalid Spirit_Collection: expected a JSON array.')
  }
  return raw.map(toAssignment)
}

/**
 * Validate a single parsed element and return it as a typed `Assignment`, or
 * throw when it is missing a required field, has a wrong-typed field, or has an
 * empty title (Req 1.4, 5.4). Extra fields are tolerated and dropped so the
 * returned object matches the canonical field set and order used by `serialize`,
 * keeping the round-trip (Req 5.5) exact.
 *
 * @param el a single element of the parsed array.
 * @param index the element's position, used in diagnostic messages.
 * @returns the validated `Assignment`.
 * @throws Error when the element is not a plain object or fails a field check.
 */
function toAssignment(el: unknown, index: number): Assignment {
  if (typeof el !== 'object' || el === null || Array.isArray(el)) {
    throw new Error(`Invalid assignment at index ${index}: expected a plain object.`)
  }

  const o = el as Record<string, unknown>
  const { id, title, subject, dueDate, priority, completed, completedAt } = o

  if (typeof id !== 'string') {
    throw new Error(`Invalid assignment at index ${index}: 'id' must be a string.`)
  }
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`Invalid assignment at index ${index}: 'title' must be a non-empty string.`)
  }
  if (typeof subject !== 'string') {
    throw new Error(`Invalid assignment at index ${index}: 'subject' must be a string.`)
  }
  if (typeof dueDate !== 'string') {
    throw new Error(`Invalid assignment at index ${index}: 'dueDate' must be a string.`)
  }
  if (typeof priority !== 'string' || !VALID_PRIORITIES.has(priority as Priority)) {
    throw new Error(
      `Invalid assignment at index ${index}: 'priority' must be 'low', 'medium', or 'high'.`,
    )
  }
  if (typeof completed !== 'boolean') {
    throw new Error(`Invalid assignment at index ${index}: 'completed' must be a boolean.`)
  }
  if (completedAt !== null && typeof completedAt !== 'string') {
    throw new Error(
      `Invalid assignment at index ${index}: 'completedAt' must be a string or null.`,
    )
  }

  return {
    id,
    title,
    subject,
    dueDate,
    priority: priority as Priority,
    completed,
    completedAt: completedAt as string | null,
  }
}

/**
 * Load the Spirit_Collection from `storage` (Req 5.2).
 *
 * When the key is absent the collection starts empty (Req 5.3). When the stored
 * value is missing fields, wrongly typed, or not valid JSON, the corrupted data
 * is discarded and the collection starts empty (Req 5.4). The `storage` instance
 * is injected (never imported from `window`) so this stays testable; tests pass
 * a mock `Storage`.
 *
 * @param storage the `Storage` to read from (e.g. `localStorage`).
 * @returns the reconstructed collection, or `[]` when absent or corrupted.
 */
export function loadCollection(storage: Storage): Assignment[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) {
      return [] // Req 5.3: no saved data -> empty collection
    }
    return deserialize(JSON.parse(raw))
  } catch {
    return [] // Req 5.4: corrupted/invalid data -> discard, start empty
  }
}

/**
 * Persist a Spirit_Collection to `storage` (Req 5.1).
 *
 * The collection is serialized with `serialize` and written under
 * `STORAGE_KEY`. A `QuotaExceededError` or an unavailable store (e.g. private
 * mode) is caught and surfaced as a non-blocking warning; in-memory state stays
 * correct for the rest of the session. The `storage` instance is injected
 * (never imported from `window`); tests pass a mock `Storage`.
 *
 * @param storage the `Storage` to write to (e.g. `localStorage`).
 * @param c the Spirit_Collection to persist.
 */
export function saveCollection(storage: Storage, c: Assignment[]): void {
  try {
    storage.setItem(STORAGE_KEY, serialize(c))
  } catch (e) {
    // QuotaExceededError or storage unavailable: swallow + warn (non-blocking).
    console.warn("Spirits couldn't be saved — storage is full or unavailable.", e)
  }
}
