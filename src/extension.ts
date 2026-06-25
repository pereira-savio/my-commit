import * as vscode from 'vscode';
import type { GitExtension, GitAPI, Repository } from './git.d';
import { validateCommitMessage } from './validator';
import { ConfigPanel } from './configPanel';
import { ConfigManager } from './configManager';

let statusBarItem: vscode.StatusBarItem;
let pollInterval: ReturnType<typeof setInterval> | undefined;

export function activate(context: vscode.ExtensionContext): void {
  // ── Carrega configurações do arquivo .vscode/settings.json ────────────────
  const loadedConfig = ConfigManager.loadConfig();
  if (loadedConfig) {
    console.log('[My Commit] Configurações carregadas de .vscode/settings.json');
  }

  // ── Status bar ─────────────────────────────────────────────────────────────
  statusBarItem = vscode.window.createStatusBarItem(
    'my-commit.validation',
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'my-commit.createCommit';
  context.subscriptions.push(statusBarItem);

  // ── Comando: Criar commit ──────────────────────────────────────────────────
  const createCommand = vscode.commands.registerCommand(
    'my-commit.createCommit',
    async () => {
      console.log('[My Commit] Comando de criar commit acionado');
      
      // Abre o painel de configurações e aguarda o usuário salvar
      const commitConfig = await ConfigPanel.show();
      if (!commitConfig) {
        console.log('[My Commit] Usuário fechou o painel sem salvar');
        return; // usuário fechou o painel sem salvar
      }

      console.log('[My Commit] Configuração recebida:', commitConfig);
      
      // Persiste as configurações no arquivo .vscode/settings.json
      const success = await ConfigManager.saveConfig(commitConfig);
      if (success) {
        console.log('[My Commit] Configuração salva com sucesso');
        vscode.window.showInformationMessage('✔ Configurações do My Commit salvas com sucesso em .vscode/settings.json!');
      } else {
        console.log('[My Commit] Falha ao salvar configuração');
      }
    }
  );

  // ── Comando: Validar commit atual ──────────────────────────────────────────
  const validateCommand = vscode.commands.registerCommand(
    'my-commit.validateCommit',
    () => {
      const repo = getFirstRepository();
      if (!repo) {
        vscode.window.showWarningMessage(
          'Nenhum repositório Git encontrado na área de trabalho.'
        );
        return;
      }

      const result = validateCommitMessage(repo.inputBox.value);
      if (result.valid) {
        vscode.window.showInformationMessage(
          '✔ Mensagem válida no padrão Conventional Commits!'
        );
      } else {
        vscode.window.showWarningMessage(
          `✘ Commit inválido: ${result.message}`
        );
      }
    }
  );

  context.subscriptions.push(createCommand, validateCommand);

  // ── Polling para validação na status bar ───────────────────────────────────
  startStatusBarPolling(context);
}

export function deactivate(): void {
  if (pollInterval !== undefined) {
    clearInterval(pollInterval);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGitAPI(): GitAPI | undefined {
  const ext = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!ext?.isActive) {
    return undefined;
  }
  return ext.exports.getAPI(1);
}

function getFirstRepository(): Repository | undefined {
  return getGitAPI()?.repositories[0];
}

async function setScmInputValue(message: string): Promise<boolean> {
  const repo = getFirstRepository();
  if (repo) {
    repo.inputBox.value = message;
    return true;
  }

  // Fallback: copia para área de transferência
  await vscode.env.clipboard.writeText(message);
  vscode.window.showInformationMessage(
    'Repositório Git não encontrado. Mensagem copiada para a área de transferência.'
  );
  return false;
}

function startStatusBarPolling(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('myCommit');
  if (!config.get<boolean>('showStatusBar', true)) {
    return;
  }

  pollInterval = setInterval(() => updateStatusBar(), 1500);
  context.subscriptions.push({ dispose: () => clearInterval(pollInterval) });

  // Também atualizar quando a configuração mudar
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('myCommit.showStatusBar')) {
        const show = vscode.workspace
          .getConfiguration('myCommit')
          .get<boolean>('showStatusBar', true);
        if (!show) {
          statusBarItem.hide();
        }
      }
    })
  );
}

function updateStatusBar(): void {
  const config = vscode.workspace.getConfiguration('myCommit');
  if (!config.get<boolean>('showStatusBar', true)) {
    statusBarItem.hide();
    return;
  }

  const repo = getFirstRepository();
  if (!repo) {
    statusBarItem.hide();
    return;
  }

  const value = repo.inputBox.value;

  if (!value.trim()) {
    statusBarItem.text = '$(git-commit) My Commit';
    statusBarItem.tooltip = 'Clique para criar um commit no padrão Conventional Commits';
    statusBarItem.backgroundColor = undefined;
    statusBarItem.show();
    return;
  }

  const result = validateCommitMessage(value);
  if (result.valid) {
    statusBarItem.text = '$(check) Commit válido';
    statusBarItem.tooltip = 'Mensagem no padrão Conventional Commits ✔';
    statusBarItem.backgroundColor = undefined;
  } else {
    statusBarItem.text = `$(warning) ${result.message}`;
    statusBarItem.tooltip =
      'Mensagem fora do padrão. Clique para abrir o wizard.';
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.warningBackground'
    );
  }

  statusBarItem.show();
}
