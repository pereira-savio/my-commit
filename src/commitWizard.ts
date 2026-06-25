import * as vscode from 'vscode';

export interface CommitParts {
  type: string;
  scope?: string;
  breaking: boolean;
  description: string;
  body?: string;
  footer?: string;
}

interface CommitType extends vscode.QuickPickItem {
  label: string;
  description: string;
}

const DEFAULT_TYPES: CommitType[] = [
  { label: 'feat',     description: '✨  Nova funcionalidade' },
  { label: 'fix',      description: '🐛  Correção de bug' },
  { label: 'docs',     description: '📝  Apenas documentação' },
  { label: 'style',    description: '💄  Formatação, sem mudança de lógica' },
  { label: 'refactor', description: '♻️   Refatoração sem nova feature ou fix' },
  { label: 'perf',     description: '⚡  Melhoria de performance' },
  { label: 'test',     description: '✅  Adição ou correção de testes' },
  { label: 'build',    description: '🏗️   Build system ou dependências externas' },
  { label: 'ci',       description: '👷  Configuração de CI/CD' },
  { label: 'chore',    description: '🔧  Outras tarefas sem impacto no código' },
  { label: 'revert',   description: '⏪  Reverte um commit anterior' },
];

/** Monta a mensagem final de commit a partir das partes */
export function buildCommitMessage(parts: CommitParts): string {
  const scope = parts.scope ? `(${parts.scope})` : '';
  const bang = parts.breaking ? '!' : '';
  let message = `${parts.type}${scope}${bang}: ${parts.description}`;

  if (parts.body?.trim()) {
    message += `\n\n${parts.body.trim()}`;
  }

  if (parts.footer?.trim()) {
    message += `\n\n${parts.footer.trim()}`;
  } else if (parts.breaking) {
    message += `\n\nBREAKING CHANGE: ${parts.description}`;
  }

  return message;
}

/**
 * Executa o wizard multi-step para criar uma mensagem Conventional Commit.
 * Retorna `undefined` se o usuário cancelar em qualquer etapa.
 */
export async function runCommitWizard(
  customTypes: string[],
  customScopes: string[]
): Promise<string | undefined> {
  const typeItems: CommitType[] =
    customTypes.length > 0
      ? customTypes.map(t => ({ label: t, description: '' }))
      : DEFAULT_TYPES;

  // ── Passo 1: Tipo ──────────────────────────────────────────────────────────
  const typeItem = await vscode.window.showQuickPick(typeItems, {
    title: 'My Commit  (1 / 5) — Tipo',
    placeHolder: 'Selecione o tipo do commit',
    ignoreFocusOut: true,
    matchOnDescription: true,
  });
  if (!typeItem) {
    return undefined;
  }

  // ── Passo 2: Scope ─────────────────────────────────────────────────────────
  let scope: string | undefined;

  if (customScopes.length > 0) {
    const NO_SCOPE = '$(dash)  Sem escopo';
    const scopeItems = [
      { label: NO_SCOPE, description: 'Não especificar escopo' },
      ...customScopes.map(s => ({ label: s, description: '' })),
    ];
    const scopeItem = await vscode.window.showQuickPick(scopeItems, {
      title: 'My Commit  (2 / 5) — Escopo',
      placeHolder: 'Selecione o escopo (opcional)',
      ignoreFocusOut: true,
    });
    if (scopeItem === undefined) {
      return undefined;
    }
    if (scopeItem.label !== NO_SCOPE) {
      scope = scopeItem.label;
    }
  } else {
    const scopeInput = await vscode.window.showInputBox({
      title: 'My Commit  (2 / 5) — Escopo',
      prompt: 'Escopo do commit (opcional)',
      placeHolder: 'ex: auth, api, ui — pressione Enter para pular',
      ignoreFocusOut: true,
    });
    if (scopeInput === undefined) {
      return undefined;
    }
    scope = scopeInput.trim() || undefined;
  }

  // ── Passo 3: Breaking change ───────────────────────────────────────────────
  const breakingOptions = [
    { label: '$(check)   Não', detail: 'Mudança compatível com a versão anterior', isBreaking: false },
    { label: '$(warning) Sim', detail: 'BREAKING CHANGE — remove ou altera comportamento existente', isBreaking: true },
  ];
  const breakingItem = await vscode.window.showQuickPick(breakingOptions, {
    title: 'My Commit  (3 / 5) — Breaking Change',
    placeHolder: 'Esta mudança quebra a compatibilidade com versões anteriores?',
    ignoreFocusOut: true,
    matchOnDetail: true,
  });
  if (breakingItem === undefined) {
    return undefined;
  }
  const breaking: boolean = breakingItem.isBreaking;

  // ── Passo 4: Descrição curta ───────────────────────────────────────────────
  const description = await vscode.window.showInputBox({
    title: 'My Commit  (4 / 5) — Descrição',
    prompt: 'Descrição curta e objetiva do commit (obrigatório)',
    placeHolder: 'ex: adiciona autenticação por OAuth',
    ignoreFocusOut: true,
    validateInput(value) {
      if (!value.trim()) {
        return 'A descrição é obrigatória';
      }
      if (value.trim().length > 100) {
        return `Muito longo: ${value.trim().length}/100 caracteres`;
      }
      if (/^[A-Z]/.test(value.trim())) {
        return 'Use letras minúsculas no início da descrição';
      }
      if (/\.$/.test(value.trim())) {
        return 'Não termine a descrição com ponto final';
      }
      return null;
    },
  });
  if (description === undefined) {
    return undefined;
  }

  // ── Passo 5: Corpo (opcional) ──────────────────────────────────────────────
  const body = await vscode.window.showInputBox({
    title: 'My Commit  (5 / 5) — Corpo',
    prompt: 'Corpo da mensagem (opcional) — explique o quê e por quê',
    placeHolder: 'Pressione Enter para pular',
    ignoreFocusOut: true,
  });
  if (body === undefined) {
    return undefined;
  }

  // ── Passo extra: Footer para breaking changes ──────────────────────────────
  let footer: string | undefined;
  if (breaking) {
    const footerInput = await vscode.window.showInputBox({
      title: 'My Commit — BREAKING CHANGE',
      prompt: 'Descreva o que mudou e como migrar',
      placeHolder: 'ex: remove o endpoint /api/v1/users, use /api/v2/users',
      value: 'BREAKING CHANGE: ',
      ignoreFocusOut: true,
      validateInput(value) {
        if (!value.startsWith('BREAKING CHANGE:')) {
          return 'O footer de breaking change deve começar com "BREAKING CHANGE:"';
        }
        return null;
      },
    });
    if (footerInput === undefined) {
      return undefined;
    }
    footer = footerInput.trim() || undefined;
  }

  return buildCommitMessage({
    type: typeItem.label,
    scope,
    breaking,
    description: description.trim(),
    body: body.trim() || undefined,
    footer,
  });
}
