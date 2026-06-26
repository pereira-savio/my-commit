import { vi } from 'vitest';

export const join = vi.fn((...args) => args.join('/'));
export const dirname = vi.fn((p) => p.substring(0, p.lastIndexOf('/')));

export default {
  join,
  dirname,
};
