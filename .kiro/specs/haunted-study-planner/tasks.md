# Implementation Plan: Haunted Study Planner

## Overview

The Haunted Study Planner is a single-page, client-only React 18 + Vite + TypeScript application. Implementation follows the design's central decision: a **pure domain layer** (`src/domain/*`, no React, no I/O) that encodes every input-varying behavior and is the target of property-based testing, wrapped by a thin **hooks layer** (`src/hooks/*`) that adapts the domain to React, and a **view layer** (`src/components/*`) that only renders state and emits intents. Plain CSS (no Tailwind) provides the purple-and-orange gothic dark theme; `localStorage` persists state with no backend.

Build order: scaffold the project and types, implement and property-test the pure domain layer, add the hooks, build the components, apply the themed/responsive/reduced-motion CSS, add accessibility, run the example-based test suite, and finally configure a static build deployable to Vercel/Netlify. Each step builds on the previous one and wires into the running app; no orphaned code is left.

## Tasks

- [x] 1. Scaffold project, tooling, and shared types
  - [x] 1.1 Initialize the Vite + React + TypeScript project and install dev dependencies
    - Run the Vite React-TS scaffold; add Vitest, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, `@fast-check/vitest`, `jsdom`, and `@types/node` as dev dependencies
    - Verify the dev server boots and `src/main.tsx` mounts `App`
    - _Requirements: 7.1_
  - [x] 1.2 Configure Vitest (jsdom) and Vite static build, and create the directory structure
    - Add a Vitest config with the `jsdom` environment, globals, and `setupFiles` for `@testing-library/jest-dom`; confirm `vite build` outputs a static `dist/`
    - Create `src/domain`, `src/hooks`, `src/components`, and `src/styles` directories
    - _Requirements: 7.1_
  - [x] 1.3 Define shared TypeScript types and constants
    - Define `Priority`, `Assignment`, `AssignmentInput`, `SpiritCollection` (per design Data Models) and named constants `STORAGE_KEY` (`'haunted-study-planner:v1'`) and `ANIMATION_MS` (`<= 2000`, asserted)
    - Place in `src/domain/types.ts`
    - _Requirements: 1.1, 1.2, 1.6, 2.2, 5.1_

- [x] 2. Implement the pure domain layer (PBT target)
  - [x] 2.1 Implement `priority.ts`
    - `Priority` helpers: `PRIORITY_LABEL` map, `priorityLabel(p)` returning "Faint"/"Haunting"/"Terrifying", and `priorityRank(p)` returning 1/2/3 for low/medium/high
    - _Requirements: 1.8_
  - [x] 2.2 Implement `dateUtils.ts`
    - `startOfDay(d)` (local midnight), `parseDueDate(isoLocal)` (`new Date(isoLocal)`, local), `formatTime(d)` ("HH:MM")
    - Use local time throughout; design calendar math to survive DST via `startOfDay` + `Math.round`
    - _Requirements: 3.1, 3.3_
  - [x] 2.3 Implement `countdown.ts`
    - `calendarDaysBetween(now, due)` (startOfDay diff / DAY_MS, `Math.round`), `isRestless(due, now)` (`due < now`), `formatCountdown(now, due)` returning "Rises in N days" / "Rises in 1 day" / "Rises tonight at HH:MM" / "Restless"
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 8.3_
  - [x] 2.4 Implement `restless.ts`
    - `isRestlessGhost(a, now)` = `!a.completed && isRestless(parseDueDate(a.dueDate), now)`
    - _Requirements: 3.4, 3.5, 8.3_
  - [x] 2.5 Implement `assignment.ts`
    - `validateAssignment(input)` (non-empty trimmed title + complete `YYYY-MM-DDTHH:mm` due date), `createAssignment` (uuid id, priority default `'medium'`, `completed=false`, `completedAt=null`), `updateAssignment`, `deleteAssignment`, `banish` (set `completed=true`, `completedAt=iso(now)`), `restore` (set `completed=false`, `completedAt=null`), `collectSubjects(c, prefix)` (distinct non-empty subjects containing prefix, case-insensitive)
    - All functions are pure reducers taking and returning `Assignment[]`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.6_
  - [x] 2.6 Implement `dashboard.ts`
    - `countBanished(c)` (# completed), `countRemaining(c)` (# uncompleted), `selectMostUrgent(c, now)` (min key `(dueDate, -priorityRank)` over uncompleted, `null` if none)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 2.7 Implement `storage.ts`
    - `serialize(c)` (normalized JSON), `deserialize(raw)` (validates shape per assignment; throws on missing/wrong-typed/empty-title fields), `loadCollection(storage)` (try/parse/deserialize, catch → `[]`), `saveCollection(storage, c)` (try `setItem`, catch quota → swallow + warn)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [~] 3. Write property-based tests for the domain layer (fast-check, min 100 runs each)
  - [ ]* 3.1 Property test: CRUD preserves identity and well-formedness
    - **Property 1: CRUD preserves identity and well-formedness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.6**
  - [ ]* 3.2 Property test: Validation rejects exactly the invalid inputs
    - **Property 2: Validation rejects exactly the invalid inputs**
    - **Validates: Requirements 1.4, 1.5**
  - [ ]* 3.3 Property test: Subject autocomplete returns exactly matching distinct subjects
    - **Property 3: Subject autocomplete returns exactly the matching distinct subjects**
    - **Validates: Requirements 1.7**
  - [ ]* 3.4 Property test: Themed priority labels are exhaustive and exact
    - **Property 4: Themed priority labels are exhaustive and exact**
    - **Validates: Requirements 1.8**
  - [-] 3.5 Property test: Future-day countdown day count matches an independent day counter
    - **Property 5: Future-day countdown day count matches an independent day counter**
    - **Validates: Requirements 3.2, 3.6**
  - [ ]* 3.6 Property test: Same-day, not-yet-due countdown shows "Rises tonight"
    - **Property 6: Same-day, not-yet-due countdown shows "Rises tonight"**
    - **Validates: Requirements 3.3**
  - [-] 3.7 Property test: Restless classification is exactly "due date is in the past"
    - **Property 7: Restless classification is exactly "due date is in the past"**
    - **Validates: Requirements 3.4, 8.3**
  - [ ]* 3.8 Property test: Dashboard counts partition the collection
    - **Property 8: Dashboard counts partition the collection**
    - **Validates: Requirements 4.1**
  - [ ]* 3.9 Property test: Most-urgent selection picks earliest due date, ties by highest priority
    - **Property 9: Most-urgent selection picks the earliest due date, breaking ties by highest priority**
    - **Validates: Requirements 4.2, 4.3**
  - [ ]* 3.10 Property test: Banish then restore is a round trip
    - **Property 10: Banish then restore is a round trip**
    - **Validates: Requirements 2.1, 2.6**
  - [ ] 3.11 Property test: Serialization round-trips the collection
    - **Property 11: Serialization round-trips the collection**
    - **Validates: Requirements 5.5**

- [ ] 4. Checkpoint — domain layer and hooks compile and required tests pass
  - Ensure all required (non-optional) domain property tests pass (3.5, 3.7, 3.11) and the domain/hooks modules type-check; optional property tests marked with `*` are recommended but not blocking, ask the user if questions arise.

- [ ] 5. Implement the hooks layer
  - [ ] 5.1 Implement `useSpiritCollection`
    - Hold `collection` in `useState`; on mount load via `loadCollection(localStorage)`; on every collection change call `saveCollection(localStorage, next)`
    - Expose `add` (returns `{ ok, errors }`), `update`, `remove`, `banish`, `restore` delegating to domain reducers
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.6, 5.1, 5.2, 5.3, 5.4_
  - [ ] 5.2 Implement `useNow`
    - `useSyncExternalStore` over a 60 000 ms timer; also re-read on `window` `focus`/`visibilitychange`
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ] 5.3 Implement `useReducedMotion`
    - `useSyncExternalStore` over `matchMedia('(prefers-reduced-motion: reduce)')`
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 6. Implement the view layer components
  - [ ] 6.1 Implement `App` and banish two-phase coordination
    - Mount hooks; lay out Dashboard / form / lists / Banished section; own the banish animation coordination: if reduced motion commit immediately, else set animating, play `GhostAnimation`, commit on `animationend` or the `ANIMATION_MS` (<= 2000) fallback timer
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.1, 9.3_
  - [ ] 6.2 Implement `Dashboard`
    - Render banished count, remaining count, most-urgent title + `formatCountdown`; show "No spirits haunt you" when none; refresh on collection change
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ] 6.3 Implement `AssignmentForm` and `SubjectAutocomplete`
    - Title / Subject / Due_Date (`datetime-local`) / Priority inputs; inline validation messages blocking save; `<input list>` + `<datalist>` fed by `collectSubjects`; used for create and edit; default Priority to Medium when unset
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [ ] 6.4 Implement `SpiritCard` and `Countdown`
    - One assignment: title, subject, themed priority label, `formatCountdown(now, due)`; edit / delete / banish buttons; `Countdown` restyled for restless
    - _Requirements: 1.8, 3.1, 3.4_
  - [ ] 6.5 Implement `RestlessGroup` and `SpiritList`
    - `RestlessGroup` renders only uncompleted overdue spirits at the top; `SpiritList` renders active (non-overdue, uncompleted) spirits
    - _Requirements: 3.4, 3.5_
  - [ ] 6.6 Implement `BanishedSection`
    - Render banished spirits with a restore action; visually distinct from the active list; hide when empty
    - _Requirements: 2.5, 2.6_
  - [ ] 6.7 Implement `GhostAnimation`
    - Play the banish animation; honor reduced motion (fade or none); duration `ANIMATION_MS` <= 2000; keep the card visible during the animation
    - _Requirements: 2.1, 2.2, 2.3, 9.1_

- [ ] 7. Checkpoint — components render and integrate
  - Ensure the app renders end-to-end (create → banish → restore → dashboard updates), ask the user if questions arise.

- [ ] 8. Apply the Halloween visual theme and responsive layout
  - [ ] 8.1 Implement theme tokens and gothic font
    - Dark purple-and-orange palette as CSS custom properties; load a gothic Google Font for headings and body; wire into `src/styles/theme.css` and the entry CSS
    - _Requirements: 6.1, 6.2_
  - [ ] 8.2 Implement responsive layout
    - Reflow Dashboard / form / lists / Banished section at mobile widths with no horizontal scrolling
    - _Requirements: 6.6_
  - [ ] 8.3 Implement reduced-motion CSS overrides
    - `@media (prefers-reduced-motion: reduce)` suppresses or fades the ghost animation and all decorative animations
    - _Requirements: 9.1, 9.2_

- [ ] 9. Implement accessibility
  - [ ] 9.1 Implement keyboard operability and focus indicators
    - Every interactive control reachable and operable by keyboard; visible `:focus-visible` indicators; correct roles/labels/aria where needed
    - _Requirements: 6.4, 6.5_
  - [ ] 9.2 Verify color contrast
    - Ensure >= 4.5:1 text/background contrast across the purple-and-orange palette; adjust tokens where needed
    - _Requirements: 6.3_

- [ ] 10. Write unit, component, integration, and accessibility tests
  - [ ]* 10.1 Write unit tests for domain helpers
    - `validateAssignment`, `formatCountdown` (boundary + DST cases), `priorityLabel`, `collectSubjects`, `loadCollection`/`saveCollection` (mock Storage, empty/valid/invalid/quota)
    - _Requirements: 1.4, 1.5, 1.7, 1.8, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4_
  - [ ]* 10.2 Write component tests
    - `AssignmentForm` (valid submit, empty title message, default medium), `SubjectAutocomplete` datalist equality, `SpiritCard`/`RestlessGroup`/`SpiritList`/`BanishedSection` grouping, `Dashboard` counts + most urgent + "No spirits haunt you", `GhostAnimation` two-phase + 2000 ms fallback, `useNow` re-render within 60 s (fake timers)
    - _Requirements: 1.1, 1.4, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 3.4, 3.5, 4.1, 4.2, 4.4, 8.1, 8.2_
  - [ ]* 10.3 Write integration tests
    - `localStorage` round-trip in jsdom (create, unmount/remount, restore); corrupted-data paths (invalid JSON, missing fields, wrong types → empty); reduced-motion banish commits + persists promptly
    - _Requirements: 5.1, 5.2, 5.4, 9.1, 9.3_
  - [ ]* 10.4 Write accessibility tests
    - Keyboard tab/operate through form and cards; visible focus indicators; contrast >= 4.5:1 (axe-core or manual); reduced-motion CSS overrides asserted
    - _Requirements: 6.3, 6.4, 6.5, 9.1, 9.2_

- [ ] 11. Checkpoint — required tests pass
  - Ensure all required (non-optional) tests pass, specifically the required property tests (3.5, 3.7, 3.11); optional tests marked with `*` (other property tests, unit, component, integration, and accessibility tests) are recommended but not blocking, ask the user if questions arise.

- [ ] 12. Configure static deployment
  - [ ]* 12.1 Configure the Vite static build
    - Confirm `vite build` produces a serverless static `dist/` (single view, no client router, no backend expected)
    - _Requirements: 7.1_
  - [ ]* 12.2 Add Vercel/Netlify static hosting config
    - Add `vercel.json` / `netlify.toml` to serve `dist/` with the correct SPA fallback (single view); document the deploy command
    - _Requirements: 7.2_

- [ ] 13. Final checkpoint — build and required tests pass
  - Ensure `vite build` succeeds and all required (non-optional) tests pass; optional tasks marked with `*` (including deployment configuration 12.1–12.2 and the optional test suites) are recommended but not blocking, ask the user if questions arise.

## Notes

- Property tests 3.5 (Property 5: future-day countdown day count), 3.7 (Property 7: restless classification), and 3.11 (Property 11: serialization round-trip) are required. All other property tests (3.1, 3.2, 3.3, 3.4, 3.6, 3.8, 3.9, 3.10), the integration tests (10.3), and the deployment configuration tasks (12.1, 12.2) are marked optional with `*` and can be deferred when building the working app first.
- Each task references specific requirements for traceability; property test sub-tasks reference the design's correctness property number and the requirement clause(s) they validate.
- Checkpoints ensure incremental validation: after the domain layer, after components integrate, after the required (non-optional) tests pass, and at the final build. Checkpoints only require non-optional tasks to pass; optional tasks (marked with `*`) are recommended but not blocking.
- The pure domain layer (`src/domain/*`) is the sole target of property-based testing; the view, CSS, accessibility, and deployment behaviors are covered by example/component/integration/smoke tests.
- Implementation language is TypeScript (React + Vite), as specified by the design document's signatures and the chosen stack.
- `ANIMATION_MS` is a named constant asserted `<= 2000` to satisfy the ghost-animation duration cap; the 2000 ms fallback timer guarantees persistence even if `animationend` is missed.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "5.1", "5.2", "5.3"] },
    { "id": 4, "tasks": ["4"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"] },
    { "id": 6, "tasks": ["7"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 8, "tasks": ["9.1", "9.2"] },
    { "id": 9, "tasks": ["10.1", "10.2", "10.3", "10.4"] },
    { "id": 10, "tasks": ["11"] },
    { "id": 11, "tasks": ["12.1", "12.2"] },
    { "id": 12, "tasks": ["13"] }
  ]
}
```
