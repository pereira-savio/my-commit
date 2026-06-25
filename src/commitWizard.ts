import * as vscode from 'vscode';
import type { CommitConfig } from './configPanel';

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

const DEFAULT_TYPES_PT: CommitType[] = [
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

const DEFAULT_TYPES_EN: CommitType[] = [
  { label: 'feat',     description: '✨  New feature' },
  { label: 'fix',      description: '🐛  Bug fix' },
  { label: 'docs',     description: '📝  Documentation only' },
  { label: 'style',    description: '💄  Formatting, no logic change' },
  { label: 'refactor', description: '♻️   Refactoring, no new feature or fix' },
  { label: 'perf',     description: '⚡  Performance improvement' },
  { label: 'test',     description: '✅  Adding or fixing tests' },
  { label: 'build',    description: '🏗️   Build system or external dependencies' },
  { label: 'ci',       description: '👷  CI/CD configuration' },
  { label: 'chore',    description: '🔧  Other tasks with no code impact' },
  { label: 'revert',   description: '⏪  Reverts a previous commit' },
];

interface Strings {
  typeLabel: string;
  typePlaceholder: string;
  scopeLabel: string;
  scopePrompt: string;
  scopePlaceholder: string;
  noScope: string;
  noScopeDetail: string;
  breakingLabel: string;
  breakingPlaceholder: string;
  notBreaking: string;
  notBreakingDetail: string;
  isBreaking: string;
  isBreakingDetail: string;
  descLabel: string;
  descPrompt: string;
  descPlaceholder: string;
  descRequired: string;
  descTooLong: (len: number, max: number) => string;
  descUppercase: string;
  descPeriod: string;
  bodyLabel: string;
  bodyPrompt: string;
  bodyPlaceholder: string;
  breakingFooterPrompt: string;
  breakingFooterPlaceholder: string;
  breakingFooterValidation: string;
}

const PT: Strings = {
  typeLabel: 'Tipo',
  typePlaceholder: 'Selecione o tipo do commit',
  scopeLabel: 'Escopo',
  scopePrompt: 'Escopo do commit (opcional)',
  scopePlaceholder: 'ex: auth, api, ui — pressione Enter para pular',
  noScope: '$(dash)  Sem escopo',
  noScopeDetail: 'Não especificar escopo',
  breakingLabel: 'Breaking Change',
  breakingPlaceholder: 'Esta mudança quebra a compatibilidade com versões anteriores?',
  notBreaking: '$(check)   Não',
  notBreakingDetail: 'Mudança compatível com a versão anterior',
  isBreaking: '$(warning) Sim',
  isBreakingDetail: 'BREAKING CHANGE — remove ou altera comportamento existente',
  descLabel: 'Descrição',
  descPrompt: 'Descrição curta e objetiva do commit (obrigatório)',
  descPlaceholder: 'ex: adiciona autenticação por OAuth',
  descRequired: 'A descrição é obrigatória',
  descTooLong: (l, m) => `Muito longo: ${l}/${m} caracteres`,
  descUppercase: 'Use letras minúsculas no início da descrição',
  descPeriod: 'Não termine a descrição com ponto final',
  bodyLabel: 'Corpo',
  bodyPrompt: 'Corpo da mensagem (opcional) — explique o quê e por quê',
  bodyPlaceholder: 'Pressione Enter para pular',
  breakingFooterPrompt: 'Descreva o que mudou e como migrar',
  breakingFooterPlaceholder: 'ex: remove o endpoint /api/v1/users, use /api/v2/users',
  breakingFooterValidation: 'O footer deve começar com "BREAKING CHANGE:"',
};

const EN: Strings = {
  typeLabel: 'Type',
  typePlaceholder: 'Select commit type',
  scopeLabel: 'Scope',
  scopePrompt: 'Commit scope (optional)',
  scopePlaceholder: 'e.g.: auth, api, ui — press Enter to skip',
  noScope: '$(dash)  No scope',
  noScopeDetail: 'Do not specify scope',
  breakingLabel: 'Breaking Change',
  breakingPlaceholder: 'Does this change break backward compatibility?',
  notBreaking: '$(check)   No',
  notBreakingDetail: 'Backward compatible change',
  isBreaking: '$(warning) Yes',
  isBreakingDetail: 'BREAKING CHANGE — removes or alters existing behavior',
  descLabel: 'Description',
  descPrompt: 'Short, objective commit description (required)',
  descPlaceholder: 'e.g.: add OAuth authentication',
  descRequired: 'Description is required',
  descTooLong: (l, m) => `Too long: ${l}/${m} characters`,
  descUppercase: 'Start description with a lowercase letter',
  descPeriod: 'Do not end description with a period',
  bodyLabel: 'Body',
  bodyPrompt: 'Message body (optional) — explain what and why',
  bodyPlaceholder: 'Press Enter to skip',
  breakingFooterPrompt: 'Describe what changed and how to migrate',
  breakingFooterPlaceholder: 'e.g.: removes /api/v1/users endpoint, use /api/v2/users',
  breakingFooterValidation: 'Footer must start with "BREAKING CHANGE:"',
};

/** Monta a mensagem final de commit a partir das partes */
export function buildCommitMessage(
  parts: CommitParts,
  config?: CommitConfig,
  branchName?: string
): string {
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

  if (config?.includeBranch && branchName) {
    message += `\n\nBranch: ${branchName}`;
  }

  return message;
}

/**
 * Executa o wizard multi-step para criar a mensagem de commit,
 * respeitando as regras definidas no ConfigPanel.
 */
export async function runCommitWizard(
  customTypes: string[],
  customScopes: string[],
  commitConfig: CommitConfig,
  branchName?: string
): Promise<string | undefined> {
  const t: Strings = commitConfig.language === 'en' ? EN : PT;

  // ── Modo simples (sem Conventional Commit) ────────────────────────────────
  if (!commitConfig.conventionalCommit) {
    const description = await vscode.window.showInputBox({
      title: `My Commit  (1 / 1) — ${t.descLabel}`,
      prompt: t.descPrompt,
      placeHolder: t.descPlaceholder,
      ignoreFocusOut: true,
      validateInput(value) {
        if (!value.trim()) { return t.descRequired; }
        if (value.trim().length > commitConfig.maxLength) {
          return t.descTooLong(value.trim().length, commitConfig.maxLength);
        }
        return null;
      },
    });
    if (description === undefined) { return undefined; }

    let message = description.trim();
    if (commitConfig.includeBranch && branchName) {
      message += `\n\nBranch: ${branchName}`;
    }
    return message;
  }

  // ── Modo Conventional Commit ──────────────────────────────────────────────
  const hasScope = commitConfig.conventionalPattern === 'with-scope';
  const totalSteps = hasScope ? 5 : 4;
  let step = 1;

  // Passo: Tipo
  const defaultTypes = commitConfig.language === 'en' ? DEFAULT_TYPES_EN : DEFAULT_TYPES_PT;
  const typeItems: CommitType[] =
    customTypes.length > 0
      ? customTypes.map(label => ({ label, description: '' }))
      : defaultTypes;

  const typeItem = await vscode.window.showQuickPick(typeItems, {
    title: `My Commit  (${step++} / ${totalSteps}) — ${t.typeLabel}`,
    placeHolder: t.typePlaceholder,
    ignoreFocusOut: true,
    matchOnDescription: true,
  });
  if (!typeItem) { return undefined; }

  // Passo: Escopo (apenas se o padrão inclui scope)
  let scope: string | undefined;
  if (hasScope) {
    if (customScopes.length > 0) {
      const NO_SCOPE = t.noScope;
      const scopeItems = [
        { label: NO_SCOPE, description: t.noScopeDetail },
        ...customScopes.map(s => ({ label: s, description: '' })),
      ];
      const scopeItem = await vscode.window.showQuickPick(scopeItems, {
        title: `My Commit  (${step++} / ${totalSteps}) — ${t.scopeLabel}`,
        placeHolder: t.scopePlaceholder,
        ignoreFocusOut: true,
      });
      if (scopeItem === undefined) { return undefined; }
      if (scopeItem.label !== NO_SCOPE) { scope = scopeItem.label; }
    } else {
      const scopeInput = await vscode.window.showInputBox({
        title: `My Commit  (${step++} / ${totalSteps}) — ${t.scopeLabel}`,
        prompt: t.scopePrompt,
        placeHolder: t.scopePlaceholder,
        ignoreFocusOut: true,
      });
      if (scopeInput === undefined) { return undefined; }
      scope = scopeInput.trim() || undefined;
    }
  }

  // Passo: Breaking change
  const breakingOptions = [
    { label: t.notBreaking, detail: t.notBreakingDetail, isBreaking: false },
    { label: t.isBreaking,  detail: t.isBreakingDetail,  isBreaking: true  },
  ];
  const breakingItem = await vscode.window.showQuickPick(breakingOptions, {
    title: `My Commit  (${step++} / ${totalSteps}) — ${t.breakingLabel}`,
    placeHolder: t.breakingPlaceholder,
    ignoreFocusOut: true,
    matchOnDetail: true,
  });
  if (breakingItem === undefined) { return undefined; }
  const breaking = breakingItem.isBreaking;

  // Passo: Descrição curta
  const description = await vscode.window.showInputBox({
    title: `My Commit  (${step++} / ${totalSteps}) — ${t.descLabel}`,
    prompt: t.descPrompt,
    placeHolder: t.descPlaceholder,
    ignoreFocusOut: true,
    validateInput(value) {
      if (!value.trim()) { return t.descRequired; }
      if (value.trim().length > commitConfig.maxLength) {
        return t.descTooLong(value.trim().length, commitConfig.maxLength);
      }
      if (/^[A-Z]/.test(value.trim())) { return t.descUppercase; }
      if (/\.$/.test(value.trim())) { return t.descPeriod; }
      return null;
    },
  });
  if (description === undefined) { return undefined; }

  // Passo: Corpo (opcional)
  const body = await vscode.window.showInputBox({
    title: `My Commit  (${step++} / ${totalSteps}) — ${t.bodyLabel}`,
    prompt: t.bodyPrompt,
    placeHolder: t.bodyPlaceholder,
    ignoreFocusOut: true,
  });
  if (body === undefined) { return undefined; }

  // Passo extra: Footer para breaking changes
  let footer: string | undefined;
  if (breaking) {
    const footerInput = await vscode.window.showInputBox({
      title: 'My Commit — BREAKING CHANGE',
      prompt: t.breakingFooterPrompt,
      placeHolder: t.breakingFooterPlaceholder,
      value: 'BREAKING CHANGE: ',
      ignoreFocusOut: true,
      validateInput(value) {
        if (!value.startsWith('BREAKING CHANGE:')) { return t.breakingFooterValidation; }
        return null;
      },
    });
    if (footerInput === undefined) { return undefined; }
    footer = footerInput.trim() || undefined;
  }

  return buildCommitMessage(
    {
      type: typeItem.label,
      scope,
      breaking,
      description: description.trim(),
      body: body.trim() || undefined,
      footer,
    },
    commitConfig,
    branchName
  );
}
