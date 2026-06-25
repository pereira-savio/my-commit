import * as vscode from 'vscode';
import { ConfigManager } from './configManager';

export interface CommitConfig {
  language: 'pt' | 'en';
  conventionalCommit: boolean;
  conventionalPattern: 'with-scope' | 'without-scope';
  maxLength: number;
  includeBranch: boolean;
}

export class ConfigPanel {
  public static currentPanel: ConfigPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _resolved = false;
  private _initialConfig: CommitConfig;

  private constructor(
    panel: vscode.WebviewPanel,
    initialConfig: CommitConfig,
    private readonly _resolve: (config: CommitConfig | undefined) => void
  ) {
    this._panel = panel;
    this._initialConfig = initialConfig;
    this._panel.webview.html = this._getHtml();

    // Se o usuário fechar o painel sem clicar em Gerar, resolve com undefined
    this._panel.onDidDispose(() => {
      if (!this._resolved) {
        this._resolve(undefined);
      }
      this._cleanup();
    }, null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (msg: { command: string; config: CommitConfig }) => {
        console.log('[ConfigPanel] Mensagem recebida do webview:', msg);
        if (msg.command === 'generate') {
          console.log('[ConfigPanel] Comando "generate" reconhecido');
          console.log('[ConfigPanel] Configuração recebida:', msg.config);
          this._resolved = true;
          const config = msg.config;
          this._panel.dispose(); // dispara onDidDispose, mas _resolved=true
          // Aguarda o painel fechar completamente antes de iniciar o wizard
          setTimeout(() => {
            console.log('[ConfigPanel] Resolvendo promise com configuração');
            this._resolve(config);
          }, 150);
        }
      },
      null,
      this._disposables
    );
  }

  /**
   * Abre o painel de configurações e retorna uma Promise que resolve
   * com o CommitConfig quando o usuário clica em "Gerar",
   * ou undefined se fechar o painel sem confirmar.
   */
  public static show(): Promise<CommitConfig | undefined> {
    return new Promise<CommitConfig | undefined>((resolve) => {
      // Carrega as configurações salvas anteriormente
      const savedConfig = ConfigManager.loadConfig();
      const initialConfig = savedConfig || {
        language: 'pt',
        conventionalCommit: true,
        conventionalPattern: 'with-scope',
        maxLength: 72,
        includeBranch: false
      };

      // Se já existe um painel aberto, fecha e reabre para garantir estado limpo
      if (ConfigPanel.currentPanel) {
        ConfigPanel.currentPanel._resolved = true;
        ConfigPanel.currentPanel._panel.dispose();
      }
      const panel = vscode.window.createWebviewPanel(
        'myCommitConfig',
        'My Commit — Configurações',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      ConfigPanel.currentPanel = new ConfigPanel(panel, initialConfig, resolve);
    });
  }

  private _getHtml(): string {
    const config = this._initialConfig;
    return /* html */ `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
  <title>My Commit — Configurações</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 32px 28px 40px;
      max-width: 560px;
    }

    h1 {
      font-size: 1.15em;
      font-weight: 600;
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--vscode-foreground);
    }

    .section {
      margin-bottom: 22px;
    }

    .section-label {
      font-size: 0.78em;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
    }

    .toggle-group {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .toggle-btn {
      padding: 5px 14px;
      border-radius: 3px;
      border: 1px solid var(--vscode-button-secondaryBackground, #3a3d41);
      background: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #cccccc);
      cursor: pointer;
      font-size: 0.875em;
      font-family: inherit;
    }

    .toggle-btn:hover:not(.active) {
      background: var(--vscode-button-secondaryHoverBackground, #45494e);
    }

    .toggle-btn.active {
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #ffffff);
      border-color: var(--vscode-button-background, #0e639c);
    }

    .pattern-btn {
      font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
      font-size: 0.82em;
      padding: 5px 12px;
    }

    .number-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .number-input {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 3px;
      padding: 5px 10px;
      font-size: 0.9em;
      font-family: inherit;
      width: 80px;
    }

    .number-input:focus {
      outline: 1px solid var(--vscode-focusBorder);
      border-color: var(--vscode-focusBorder);
    }

    .number-hint {
      font-size: 0.8em;
      color: var(--vscode-descriptionForeground);
    }

    .hidden { display: none !important; }

    hr {
      border: none;
      border-top: 1px solid var(--vscode-panel-border, #3a3d41);
      margin: 28px 0;
    }

    #generateBtn {
      width: 100%;
      padding: 10px 0;
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #ffffff);
      border: none;
      border-radius: 3px;
      font-size: 0.95em;
      font-family: inherit;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.02em;
    }

    #generateBtn:hover {
      background: var(--vscode-button-hoverBackground, #1177bb);
    }

    #generateBtn:active {
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <h1>⚙️ My Commit — Configurações</h1>

  <!-- Idioma -->
  <div class="section">
    <div class="section-label">Texto em</div>
    <div class="toggle-group" id="langGroup">
      <button class="toggle-btn active" data-val="pt">Português</button>
      <button class="toggle-btn" data-val="en">English</button>
    </div>
  </div>

  <!-- Conventional Commit -->
  <div class="section">
    <div class="section-label">Ativar Conventional Commit?</div>
    <div class="toggle-group" id="conventionalGroup">
      <button class="toggle-btn active" data-val="true">Sim</button>
      <button class="toggle-btn" data-val="false">Não</button>
    </div>
  </div>

  <!-- Padrão (só quando Conventional = Sim) -->
  <div class="section" id="patternSection">
    <div class="section-label">Padrão</div>
    <div class="toggle-group" id="patternGroup">
      <button class="toggle-btn pattern-btn active" data-val="with-scope">type(scope): descrição</button>
      <button class="toggle-btn pattern-btn" data-val="without-scope">type: descrição</button>
    </div>
  </div>

  <!-- Máximo de caracteres -->
  <div class="section">
    <div class="section-label">Máximo de caracteres da descrição</div>
    <div class="number-row">
      <input class="number-input" type="number" id="maxLength" value="72" min="10" max="200" />
      <span class="number-hint">caracteres</span>
    </div>
  </div>

  <!-- Referência à branch -->
  <div class="section">
    <div class="section-label">Referenciar branch no commit?</div>
    <div class="toggle-group" id="branchGroup">
      <button class="toggle-btn" data-val="true">Sim</button>
      <button class="toggle-btn active" data-val="false">Não</button>
    </div>
  </div>

  <hr />
  <button id="generateBtn">Salvar</button>

  <script>
    const vscode = acquireVsCodeApi();

    const state = {
      language: '${config.language}',
      conventionalCommit: ${config.conventionalCommit},
      conventionalPattern: '${config.conventionalPattern}',
      maxLength: ${config.maxLength},
      includeBranch: ${config.includeBranch}
    };

    function setupToggle(groupId, stateKey, parse) {
      const group = document.getElementById(groupId);
      group.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state[stateKey] = parse ? parse(btn.dataset.val) : btn.dataset.val;
          if (stateKey === 'conventionalCommit') {
            document.getElementById('patternSection').classList.toggle('hidden', !state.conventionalCommit);
          }
        });
      });
    }

    // Restaura o estado dos botões baseado nas configurações carregadas
    function restoreToggleState() {
      // Idioma
      document.querySelectorAll('#langGroup .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === state.language);
      });

      // Conventional Commit
      document.querySelectorAll('#conventionalGroup .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', (btn.dataset.val === 'true') === state.conventionalCommit);
      });

      // Padrão
      document.querySelectorAll('#patternGroup .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === state.conventionalPattern);
      });
      document.getElementById('patternSection').classList.toggle('hidden', !state.conventionalCommit);

      // Branch
      document.querySelectorAll('#branchGroup .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', (btn.dataset.val === 'true') === state.includeBranch);
      });

      // Máximo de caracteres
      document.getElementById('maxLength').value = state.maxLength;
    }

    setupToggle('langGroup', 'language');
    setupToggle('conventionalGroup', 'conventionalCommit', v => v === 'true');
    setupToggle('patternGroup', 'conventionalPattern');
    setupToggle('branchGroup', 'includeBranch', v => v === 'true');
    
    // Restaura o estado visual dos botões
    restoreToggleState();

    document.getElementById('generateBtn').addEventListener('click', () => {
      const raw = parseInt(document.getElementById('maxLength').value, 10);
      state.maxLength = (!isNaN(raw) && raw >= 10) ? raw : 72;
      
      vscode.postMessage({ command: 'generate', config: Object.assign({}, state) });
    });
  </script>
</body>
</html>`;
  }

  private _cleanup(): void {
    ConfigPanel.currentPanel = undefined;
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables = [];
  }
}
