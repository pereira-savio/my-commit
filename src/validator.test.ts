import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateCommitMessage } from './validator';
import { ConfigManager } from './configManager';

// Mock do ConfigManager
vi.mock('./configManager');

describe('Validator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateCommitMessage', () => {
    it('deve retornar inválido para mensagem vazia', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const result = validateCommitMessage('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Mensagem vazia');
    });

    it('deve retornar inválido para mensagem com apenas espaços', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const result = validateCommitMessage('   \n  \t  ');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Mensagem vazia');
    });

    it('deve retornar válido quando conventionalCommit está desabilitado', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue({
        language: 'pt',
        conventionalCommit: false,
        conventionalPattern: 'without-scope',
        maxLength: 100,
        includeBranch: false,
      });

      const result = validateCommitMessage('Qualquer mensagem aqui');
      expect(result.valid).toBe(true);
    });

    it('deve retornar válido quando config é null', () => {
      const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
      mockLoadConfig.mockReturnValue(null);

      const result = validateCommitMessage('Qualquer mensagem aqui');
      expect(result.valid).toBe(true);
    });

    describe('Padrão without-scope', () => {
      beforeEach(() => {
        const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
        mockLoadConfig.mockReturnValue({
          language: 'pt',
          conventionalCommit: true,
          conventionalPattern: 'without-scope',
          maxLength: 100,
          includeBranch: false,
        });
      });

      it('deve validar formato válido: feat: descrição', () => {
        const result = validateCommitMessage('feat: adicionar autenticação');
        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });

      it('deve validar todos os tipos de commit válidos', () => {
        const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

        types.forEach(type => {
          const result = validateCommitMessage(`${type}: descrição válida`);
          expect(result.valid).toBe(true);
          expect(result.message).toBeUndefined();
        });
      });

      it('deve validar breaking change com exclamação', () => {
        const result = validateCommitMessage('feat!: breaking change na API');
        expect(result.valid).toBe(true);
      });

      it('deve retornar inválido para tipo desconhecido', () => {
        const result = validateCommitMessage('invalid: descrição');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Formato esperado: type: descrição');
      });

      it('deve retornar inválido sem dois pontos e espaço', () => {
        const result = validateCommitMessage('feat:descrição');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Formato esperado: type: descrição');
      });

      it('deve retornar inválido para descrição vazia (apenas espaço)', () => {
        const result = validateCommitMessage('feat: ');
        expect(result.valid).toBe(false);
        // Regex rejeita porque .+ exige pelo menos um caractere após ': '
        expect(result.message).toBe('Formato esperado: type: descrição');
      });

      it('deve validar comprimento máximo da mensagem', () => {
        const longDescription = 'a'.repeat(95);
        const result = validateCommitMessage(`feat: ${longDescription}`);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('Primeira linha muito longa');
      });

      it('deve respeitar maxLength configurável', () => {
        const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
        mockLoadConfig.mockReturnValue({
          language: 'pt',
          conventionalCommit: true,
          conventionalPattern: 'without-scope',
          maxLength: 50,
          includeBranch: false,
        });

        const result = validateCommitMessage('feat: ' + 'a'.repeat(50));
        expect(result.valid).toBe(false);
        expect(result.message).toContain('56/50');
      });
    });

    describe('Padrão with-scope', () => {
      beforeEach(() => {
        const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
        mockLoadConfig.mockReturnValue({
          language: 'pt',
          conventionalCommit: true,
          conventionalPattern: 'with-scope',
          maxLength: 100,
          includeBranch: false,
        });
      });

      it('deve validar formato com escopo: feat(scope): descrição', () => {
        const result = validateCommitMessage('feat(auth): adicionar autenticação');
        expect(result.valid).toBe(true);
      });

      it('deve validar formato sem escopo (escopo opcional)', () => {
        const result = validateCommitMessage('feat: adicionar autenticação');
        expect(result.valid).toBe(true);
      });

      it('deve validar breaking change com escopo', () => {
        const result = validateCommitMessage('feat(api)!: breaking change');
        expect(result.valid).toBe(true);
      });

      it('deve validar escopo com espaço (permitido pelo regex)', () => {
        const result = validateCommitMessage('feat(auth desc): adicionar autenticação');
        // O regex [^()\r\n]+ permite espaços dentro dos parênteses
        expect(result.valid).toBe(true);
      });

      it('deve retornar inválido para escopo malformado (parênteses aninhados)', () => {
        const result = validateCommitMessage('feat((auth)): adicionar autenticação');
        expect(result.valid).toBe(false);
      });
    });

    describe('Mensagens com múltiplas linhas', () => {
      beforeEach(() => {
        const mockLoadConfig = vi.mocked(ConfigManager.loadConfig);
        mockLoadConfig.mockReturnValue({
          language: 'pt',
          conventionalCommit: true,
          conventionalPattern: 'without-scope',
          maxLength: 100,
          includeBranch: false,
        });
      });

      it('deve validar apenas a primeira linha', () => {
        const message = `feat: título do commit
Este é o corpo da mensagem com mais detalhes
e pode ter múltiplas linhas`;

        const result = validateCommitMessage(message);
        expect(result.valid).toBe(true);
      });

      it('deve validar comprimento apenas da primeira linha', () => {
        const longBody = 'x'.repeat(150);
        const message = `feat: título válido
${longBody}`;

        const result = validateCommitMessage(message);
        expect(result.valid).toBe(true);
      });
    });
  });
});
