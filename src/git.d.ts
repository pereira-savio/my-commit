/**
 * Minimal type definitions for the VS Code built-in Git extension API.
 * Based on: https://github.com/microsoft/vscode/blob/main/extensions/git/src/api/git.d.ts
 */

export interface GitExtension {
  enabled: boolean;
  readonly onDidChangeEnablement: (listener: (e: boolean) => void) => { dispose(): void };
  getAPI(version: 1): GitAPI;
}

export interface GitAPI {
  readonly state: 'uninitialized' | 'initialized';
  readonly repositories: Repository[];
  readonly onDidOpenRepository: (listener: (r: Repository) => void) => { dispose(): void };
  readonly onDidCloseRepository: (listener: (r: Repository) => void) => { dispose(): void };
}

export interface Repository {
  readonly rootUri: import('vscode').Uri;
  readonly inputBox: InputBox;
  readonly state: RepositoryState;
}

export interface InputBox {
  value: string;
  placeholder: string;
  enabled: boolean;
  visible: boolean;
}

export interface RepositoryState {
  readonly HEAD: Branch | undefined;
}

export interface Branch {
  readonly name: string | undefined;
  readonly upstream?: { name: string; remote: string };
}
