import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: path.resolve(__dirname),
  oxc: false,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    alias: {
      '@': path.resolve(__dirname, './'),
      '@wishhub/telemetry': path.resolve(__dirname, '../../packages/telemetry/src/index.ts'),
      '@wishhub/auth': path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@wishhub/ai': path.resolve(__dirname, '../../packages/ai/src/index.ts'),
      '@wishhub/wishlist': path.resolve(__dirname, '../../packages/wishlist/src/index.ts'),
      '@wishhub/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@wishhub/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
      '@wishhub/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@wishhub/utils': path.resolve(__dirname, '../../packages/utils/index.ts'),
      '@wishhub/api-client': path.resolve(__dirname, '../../packages/api-client/src/index.ts'),
      '@wishhub/sdk': path.resolve(__dirname, '../../packages/sdk/src/index.ts'),
      '@wishhub/contracts': path.resolve(__dirname, '../../packages/contracts/src/index.ts'),
      'zod': path.resolve(__dirname, '../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js'),
    },
  },
});
