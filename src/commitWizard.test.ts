import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildCommitMessage, type CommitParts } from './commitWizard';
import type { CommitConfig } from './configPanel';

describe('CommitWizard', () => {
  describe('buildCommitMessage', () => {
    const defaultConfig: CommitConfig = {
      language: 'pt',
      conventionalCommit: true,
      conventionalPattern: 'without-scope',
      maxLength: 100,
      includeBranch: false,
    };

    it('deve construir mensagem básica sem escopo', () => {
      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toBe('feat: adicionar autenticação');
    });

    it('deve construir mensagem com escopo', () => {
      const parts: CommitParts = {
        type: 'fix',
        scope: 'auth',
        description: 'corrigir erro de login',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toBe('fix(auth): corrigir erro de login');
    });

    it('deve adicionar ! para breaking changes com BREAKING CHANGE footer automático', () => {
      const parts: CommitParts = {
        type: 'feat',
        scope: 'api',
        description: 'remover endpoint antigo',
        breaking: true,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toContain('feat(api)!: remover endpoint antigo');
      expect(result).toContain('BREAKING CHANGE: remover endpoint antigo');
    });

    it('deve incluir corpo quando fornecido', () => {
      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        body: 'Implementa OAuth 2.0\nSuporta login com Google e GitHub',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toContain('feat: adicionar autenticação');
      expect(result).toContain('\n\nImplementa OAuth 2.0');
      expect(result).toContain('Suporta login com Google e GitHub');
    });

    it('deve incluir footer quando fornecido', () => {
      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        footer: 'Closes #123',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toContain('feat: adicionar autenticação');
      expect(result).toContain('\n\nCloses #123');
    });

    it('deve adicionar BREAKING CHANGE quando breaking é true e sem footer', () => {
      const parts: CommitParts = {
        type: 'feat',
        description: 'remover suporte a IE11',
        breaking: true,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toContain('\n\nBREAKING CHANGE: remover suporte a IE11');
    });

    it('deve incluir nome da branch quando configurado', () => {
      const configWithBranch: CommitConfig = {
        ...defaultConfig,
        includeBranch: true,
      };

      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        breaking: false,
      };

      const result = buildCommitMessage(parts, configWithBranch, 'feature/oauth');
      expect(result).toContain('\n\nBranch: feature/oauth');
    });

    it('deve não incluir branch quando config está desabilitado', () => {
      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig, 'feature/oauth');
      expect(result).not.toContain('Branch:');
    });

    it('deve descartar espaços em branco do corpo', () => {
      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        body: '  \n  Implementa OAuth  \n  ',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toBe('feat: adicionar autenticação\n\nImplementa OAuth');
    });

    it('deve ignorar corpo vazio', () => {
      const parts: CommitParts = {
        type: 'feat',
        description: 'adicionar autenticação',
        body: '   ',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toBe('feat: adicionar autenticação');
    });

    it('deve combinar todos os elementos corretamente', () => {
      const configWithBranch: CommitConfig = {
        ...defaultConfig,
        includeBranch: true,
      };

      const parts: CommitParts = {
        type: 'feat',
        scope: 'auth',
        description: 'implementar OAuth',
        body: 'Adiciona suporte para Google e GitHub',
        footer: 'BREAKING CHANGE: remove suporte a autenticação local',
        breaking: true,
      };

      const result = buildCommitMessage(parts, configWithBranch, 'feature/oauth');

      expect(result).toContain('feat(auth)!: implementar OAuth');
      expect(result).toContain('Adiciona suporte para Google e GitHub');
      expect(result).toContain('BREAKING CHANGE: remove suporte a autenticação local');
      expect(result).toContain('Branch: feature/oauth');
    });

    it('deve funcionar sem config (valores padrão)', () => {
      const parts: CommitParts = {
        type: 'fix',
        description: 'corrigir erro',
        breaking: false,
      };

      const result = buildCommitMessage(parts);
      expect(result).toBe('fix: corrigir erro');
    });

    it('deve construir mensagem sem escopo quando scope é undefined', () => {
      const parts: CommitParts = {
        type: 'fix',
        scope: undefined,
        description: 'corrigir erro',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toBe('fix: corrigir erro');
    });

    it('deve construir mensagem sem escopo quando scope é string vazia', () => {
      const parts: CommitParts = {
        type: 'fix',
        scope: '',
        description: 'corrigir erro',
        breaking: false,
      };

      const result = buildCommitMessage(parts, defaultConfig);
      expect(result).toBe('fix: corrigir erro');
    });
  });
});
