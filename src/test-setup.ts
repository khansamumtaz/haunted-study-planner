// Test setup: register @testing-library/jest-dom matchers with vitest.
// The "/vitest" subpath imports vitest's `expect` explicitly and augments
// vitest's Assertion type (e.g. toBeInTheDocument) so tsc type-checks matchers.
import '@testing-library/jest-dom/vitest'
