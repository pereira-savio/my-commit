import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateCommitMessage } from './validator';
import { buildCommitMessage, type CommitParts } from './commitWizard';
import type { CommitConfig } from './configPanel';
import { ConfigManager } from './configManager';

// Mock do ConfigManager
vi.mock('./configManager', async () => ({
  ConfigManager: {
    loadConfig: vi.fn(),
    saveConfig: vi.fn(),
  },
}));

vi.mock('vscode');
vi.mock('fs');
vi.mock('path');

describe('Integração: Validator + Commit Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fluxo completo: criar commit e validar', () => {
    it('deve criar e validar commit sem escopo válido', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      // Simula construção do commit
      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação OAuth',
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(message).toBe('feat: adicionar autenticação OAuth');
      expect(validation.valid).toBe(true);
    });

    it('deve criar e validar commit com escopo válido', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'with-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'fix',
        scope: 'auth',
        description: 'corrigir erro de login',
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'with-scope',
        maxLength: 100,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(message).toBe('fix(auth): corrigir erro de login');
      expect(validation.valid).toBe(true);
    });

    it('deve criar commit breaking change e validar', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'feat',
        description: 'remover suporte a IE11',
        breaking: true,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(message).toContain('feat!: remover suporte a IE11');
      expect(validation.valid).toBe(true);
    });

    it('deve detectar commit inválido (tipo desconhecido)', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const invalidMessage = 'invalid: descrição do commit';
      const validation = validateCommitMessage(invalidMessage);

      expect(validation.valid).toBe(false);
      expect(validation.message).toBe('Formato esperado: type: descrição');
    });

    it('deve detectar commit com descrição muito longa', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 50,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'feat',
        description: 'a'.repeat(60),
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 50,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('Primeira linha muito longa');
    });

    it('deve respeitar diferentes maxLength em construção e validação', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 80,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar novo recurso importante ao sistema',
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 80,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(message.length).toBe('feat: adicionar novo recurso importante ao sistema'.length);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Fluxo: diferentes configurações de padrão', () => {
    it('deve validar padrão without-scope criado pelo wizard', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'refactor',
        scope: undefined, // Sem escopo para without-scope
        description: 'simplificar lógica de validação',
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(message).toBe('refactor: simplificar lógica de validação');
      expect(validation.valid).toBe(true);
    });

    it('deve validar padrão with-scope criado pelo wizard', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'with-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'test',
        scope: 'commitWizard',
        description: 'adicionar testes unitários',
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'with-scope',
        maxLength: 100,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(message).toBe('test(commitWizard): adicionar testes unitários');
      expect(validation.valid).toBe(true);
    });
  });

  describe('Fluxo: validação com múltiplas linhas', () => {
    it('deve validar commit com corpo', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar suporte a OAuth',
        body: 'Implementa OAuth 2.0\nSuporta Google e GitHub',
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(message).toContain('feat: adicionar suporte a OAuth');
      expect(message).toContain('Implementa OAuth 2.0');
      expect(validation.valid).toBe(true); // Valida apenas primeira linha
    });

    it('deve validar apenas primeira linha mesmo com corpo longo', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 50,
        includeBranch: false,
      });

      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        body: 'x'.repeat(200),
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 50,
        includeBranch: false,
      };

      const message = buildCommitMessage(parts, config);
      const validation = validateCommitMessage(message);

      expect(validation.valid).toBe(true); // Corpo não afeta validação
    });
  });

  describe('Fluxo: configuração desabilitada (sem Conventional Commit)', () => {
    it('deve aceitar qualquer mensagem quando conventionalCommit é false', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: false,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const messages = [
        'qualquer mensagem',
        'sem seguir padrão convencional',
        'apenas texto aleatório',
      ];

      messages.forEach(msg => {
        const validation = validateCommitMessage(msg);
        expect(validation.valid).toBe(true);
      });
    });
  });

  describe('Fluxo: validação com branch incluído', () => {
    it('deve incluir branch na mensagem quando configurado', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: true,
      });

      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar feature',
        breaking: false,
      };

      const config: CommitConfig = {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: true,
      };

      const message = buildCommitMessage(parts, config, 'feature/auth');
      const validation = validateCommitMessage(message);

      expect(message).toContain('Branch: feature/auth');
      expect(validation.valid).toBe(true);
    });
  });
});
