import { vi } from 'vitest';

export const workspace = {
  workspaceFolders: [
    {
      uri: {
        fsPath: '/mock/workspace',
      },
    },
  ],
};

export const window = {
  showErrorMessage: vi.fn(),
  showInformationMessage: vi.fn(),
};

export const commands = {
  executeCommand: vi.fn(),
};

export const StatusBarAlignment = {
  Left: 0,
  Right: 1,
};

export function createStatusBarItem() {
  return {
    command: '',
    dispose: vi.fn(),
  };
}

export default {
  workspace,
  window,
  commands,
  StatusBarAlignment,
  createStatusBarItem,
};
