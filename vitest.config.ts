import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'out'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'out/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/git.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vscode': path.resolve(__dirname, './src/__mocks__/vscode.ts'),
      'fs': path.resolve(__dirname, './src/__mocks__/fs.ts'),
      'path': path.resolve(__dirname, './src/__mocks__/path.ts'),
    },
  },
});
