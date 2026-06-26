import { vi } from 'vitest';

export const existsSync = vi.fn(() => true);
export const readFileSync = vi.fn(() => '{}');
export const writeFileSync = vi.fn();
export const mkdirSync = vi.fn();

export default {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
};
