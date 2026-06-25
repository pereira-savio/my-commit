/** Regex para validar o formato Conventional Commit na primeira linha */
export const CONVENTIONAL_COMMIT_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^()\r\n]+\))?(!)?: .+/;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Valida se uma mensagem de commit segue o padrão Conventional Commits.
 * Verifica apenas a primeira linha (header).
 */
export function validateCommitMessage(message: string): ValidationResult {
  if (!message.trim()) {
    return { valid: false, message: 'Mensagem vazia' };
  }

  const firstLine = message.split('\n')[0];

  if (!CONVENTIONAL_COMMIT_REGEX.test(firstLine)) {
    return {
      valid: false,
      message: 'Formato esperado: type(scope): descrição',
    };
  }

  const colonIndex = firstLine.indexOf(': ');
  const description = firstLine.slice(colonIndex + 2);

  if (description.length === 0) {
    return { valid: false, message: 'Descrição não pode ser vazia' };
  }

  if (firstLine.length > 100) {
    return {
      valid: false,
      message: `Primeira linha muito longa: ${firstLine.length}/100 caracteres`,
    };
  }

  return { valid: true };
}
