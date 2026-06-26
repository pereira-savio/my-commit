import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import type { CommitConfig } from './configPanel';

vi.mock('vscode');
vi.mock('fs');
vi.mock('path');

describe('ConfigManager', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Setup path mock
    const mockPath = vi.mocked(path);
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));
    mockPath.dirname.mockImplementation((p: string) => p.split('/').slice(0, -1).join('/'));
    
    // Reset vscode workspace folders
    vscode.workspace.workspaceFolders = [
      {
        uri: {
          fsPath: '/mock/workspace',
        },
      },
    ];
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('loadConfig', () => {
    it('deve retornar null quando não há workspace folders', () => {
      vscode.workspace.workspaceFolders = [];
      const result = ConfigManager.loadConfig();
      expect(result).toBeNull();
    });

    it('deve retornar null quando arquivo settings.json não existe', () => {
      const mockFs = vi.mocked(fs);
      mockFs.existsSync.mockReturnValue(false);
      const result = ConfigManager.loadConfig();
      expect(result).toBeNull();
    });

    it('deve retornar null quando JSON é inválido', () => {
      const mockFs = vi.mocked(fs);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json {');
      const result = ConfigManager.loadConfig();
      expect(result).toBeNull();
    });

    it('deve retornar null quando configuração não está presente', () => {
      const mockFs = vi.mocked(fs);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{}');
      const result = ConfigManager.loadConfig();
      expect(result).toBeNull();
    });
  });

  describe('saveConfig', () => {
    it('deve retornar false quando não há workspace folders', async () => {
      vscode.workspace.workspaceFolders = [];
      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      };
      const result = await ConfigManager.saveConfig(config);
      expect(result).toBe(false);
    });

    it('deve retornar false quando falha ao salvar', async () => {
      const mockFs = vi.mocked(fs);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      };
      const result = await ConfigManager.saveConfig(config);
      expect(result).toBe(false);
    });
  });

  describe('clearConfig', () => {
    it('deve retornar false quando arquivo não existe', async () => {
      const mockFs = vi.mocked(fs);
      mockFs.existsSync.mockReturnValue(false);
      const result = await ConfigManager.clearConfig();
      expect(result).toBe(false);
    });

    it('deve retornar false quando JSON é inválido', async () => {
      const mockFs = vi.mocked(fs);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');
      const result = await ConfigManager.clearConfig();
      expect(result).toBe(false);
    });
  });
});
