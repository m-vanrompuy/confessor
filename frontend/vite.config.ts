/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // atomic-bomb's generated tests render with react-dom/server (no DOM
  // needed), so the default 'node' test environment is enough - no jsdom.
  test: {
    setupFiles: ['./src/test-setup.ts'],
  },
})
