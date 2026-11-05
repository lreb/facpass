import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/security/**', 'src/features/**/*.{ts,tsx}', 'src/lib/**'],
      exclude: ['**/*.test.*', 'src/test/**', 'src/**/*.d.ts'],
    },
  },
});
