import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom so component tests have a DOM
    environment: 'jsdom',
    // global describe/it/expect available without imports
    globals: true,
    // registers @testing-library/jest-dom matchers + type augmentation for vitest
    setupFiles: ['./src/test-setup.ts'],
  },
})
