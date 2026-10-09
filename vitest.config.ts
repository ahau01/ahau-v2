import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

/**
 * Svelte component tests, in a DOM. Everything else runs on `node --test`
 * (see package.json); these need Svelte compiled, which tsc can't do.
 */
export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: 'jsdom',
    include: ['src/app/**/*.test.ts']
  }
})
