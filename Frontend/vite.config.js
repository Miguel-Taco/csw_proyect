import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',              // motor de cobertura (Vitest usa V8)
      reporter: ['text', 'lcov'],  // genera lcov.info
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.{js,jsx}']
    }
  }
})
