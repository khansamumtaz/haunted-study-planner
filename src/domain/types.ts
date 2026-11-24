// Shared domain types and constants for the Haunted Study Planner.
//
// This module is part of the pure domain layer (src/domain/*): it holds no
// React or I/O. The types here describe the Assignment model and the
// Spirit_Collection that is persisted to localStorage, plus two named
// constants referenced across the app.

/** Priority levels for an Assignment. Displayed with themed names elsewhere. */
export type Priority = 'low' | 'medium' | 'high'

/**
 * A unit of student work.
 *
 * An uncompleted, non-overdue Assignment is shown as a "spirit"; a completed
 * Assignment is a "banished spirit". `id` is stable across edits (Req 1.2).
 */
export interface Assignment {
  /** Stable identity (crypto.randomUUID()); preserved across edits. */
  id: string
  /** Non-empty title; trimmed on create/edit (Req 1.4). */
  title: string
  /** Free-text subject; "" is allowed; feeds autocomplete (Req 1.7). */
  subject: string
  /** ISO local "YYYY-MM-DDTHH:mm" from a datetime-local input (Req 1.4, 3). */
  dueDate: string
  /** Urgency level; defaults to 'medium' when unset (Req 1.6). */
  priority: Priority
  /** false on create; true while banished (Req 2). */
  completed: boolean
  /** ISO timestamp when banished; null while active (Req 2.4). */
  completedAt: string | null
}

/** User input for creating or editing an Assignment. `priority` is optional. */
export interface AssignmentInput {
  title: string
  subject: string
  dueDate: string
  priority?: Priority
}

/** The complete set of Assignments; the unit persisted to localStorage. */
export type SpiritCollection = Assignment[]

/**
 * localStorage key for the persisted Spirit_Collection. Versioned (`:v1`) so
 * the storage shape can be migrated in the future (Req 5.1).
 */
export const STORAGE_KEY = 'haunted-study-planner:v1'

/**
 * Ghost animation duration in milliseconds.
 *
 * Must be <= 2000 to satisfy the ghost-animation duration cap (Req 2.2). The
 * 2000 ms fallback timer in the banish flow guarantees the banished state is
 * persisted within the cap even if the CSS `animationend` event is missed.
 */
export const ANIMATION_MS = 1500 as const

// Assertion that ANIMATION_MS stays within the 2000 ms cap (Req 2.2). The
// constant is widened to `number` here so this is a genuine runtime guard
// rather than statically dead code; if a future edit raises it above 2000,
// importing this module throws at load time.
if ((ANIMATION_MS as number) > 2000) {
  throw new Error('ANIMATION_MS must be <= 2000 (Requirement 2.2).')
}
