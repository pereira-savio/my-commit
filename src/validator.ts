import { ConfigManager } from './configManager';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Valida se uma mensagem de commit segue o padrão Conventional Commits.
 * Verifica apenas a primeira linha (header), respeitando as configurações.
 */
export function validateCommitMessage(message: string): ValidationResult {
  if (!message.trim()) {
    return { valid: false, message: 'Mensagem vazia' };
  }

  const config = ConfigManager.loadConfig();
  const firstLine = message.split('\n')[0];

  // Se não usar Conventional Commit, apenas verifica se não está vazio
  if (!config || !config.conventionalCommit) {
    return { valid: true };
  }

  // Regex para validar o padrão com ou sem escopo
  const withScopeRegex =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^()\r\n]+\))?(!)?: .+/;
  const withoutScopeRegex =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(!)?: .+/;

  const regex = config.conventionalPattern === 'with-scope' ? withScopeRegex : withoutScopeRegex;

  if (!regex.test(firstLine)) {
    const expected = config.conventionalPattern === 'with-scope'
      ? 'type(scope): descrição'
      : 'type: descrição';
    return {
      valid: false,
      message: `Formato esperado: ${expected}`,
    };
  }

  const colonIndex = firstLine.indexOf(': ');
  const description = firstLine.slice(colonIndex + 2);

  if (description.length === 0) {
    return { valid: false, message: 'Descrição não pode ser vazia' };
  }

  const maxLength = config.maxLength || 100;
  if (firstLine.length > maxLength) {
    return {
      valid: false,
      message: `Primeira linha muito longa: ${firstLine.length}/${maxLength} caracteres`,
    };
  }

  return { valid: true };
}
