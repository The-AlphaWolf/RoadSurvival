import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  // @ts-expect-error - vitest property on Vite config
  test: {
    globals: true,
    environment: 'node',
  },
});

