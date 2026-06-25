import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { CommitConfig } from './configPanel';

export class ConfigManager {
  private static readonly CONFIG_FILE_NAME = 'settings.json';
  private static readonly CONFIG_KEY = '[git-commit]';

  /**
   * Obtém o caminho do arquivo .vscode/settings.json
   */
  private static getConfigFilePath(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }
    return path.join(
      workspaceFolders[0].uri.fsPath,
      '.vscode',
      this.CONFIG_FILE_NAME
    );
  }

  /**
   * Carrega as configurações do arquivo .vscode/settings.json
   */
  static loadConfig(): CommitConfig | null {
    const filePath = this.getConfigFilePath();
    if (!filePath) {
      console.log('[ConfigManager] Nenhuma pasta de workspace encontrada');
      return null;
    }

    try {
      if (!fs.existsSync(filePath)) {
        console.log('[ConfigManager] Arquivo de configuração não encontrado');
        return null;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const settings = JSON.parse(fileContent);
      const gitCommitConfig = settings[this.CONFIG_KEY];

      if (gitCommitConfig) {
        console.log('[ConfigManager] Configuração carregada com sucesso');
        // Mapeia os campos de [git-commit] para CommitConfig
        const config: CommitConfig = {
          language: gitCommitConfig['editor.language'] || 'pt',
          conventionalCommit: gitCommitConfig['editor.conventionalCommit'] !== false,
          conventionalPattern: gitCommitConfig['editor.conventionalPattern'] || 'with-scope',
          maxLength: Array.isArray(gitCommitConfig['editor.rulers']) 
            ? gitCommitConfig['editor.rulers'][0] 
            : 72,
          includeBranch: gitCommitConfig['editor.includeBranch'] || false
        };
        return config;
      }

      console.log(`[ConfigManager] Chave '${this.CONFIG_KEY}' não encontrada`);
      return null;
    } catch (error) {
      console.error('[ConfigManager] Erro ao carregar configuração:', error);
      return null;
    }
  }

  /**
   * Salva as configurações no arquivo .vscode/settings.json
   */
  static async saveConfig(config: CommitConfig): Promise<boolean> {
    const filePath = this.getConfigFilePath();
    if (!filePath) {
      const msg = 'Nenhuma pasta de workspace encontrada para salvar configurações.';
      console.error('[ConfigManager]', msg);
      vscode.window.showErrorMessage(msg);
      return false;
    }

    try {
      // Garante que a pasta .vscode existe
      const vscodeDir = path.dirname(filePath);
      if (!fs.existsSync(vscodeDir)) {
        console.log('[ConfigManager] Criando diretório:', vscodeDir);
        fs.mkdirSync(vscodeDir, { recursive: true });
      }

      // Lê o arquivo existente ou cria um novo
      let settings: Record<string, unknown> = {};
      if (fs.existsSync(filePath)) {
        console.log('[ConfigManager] Lendo arquivo existente:', filePath);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        settings = JSON.parse(fileContent);
      } else {
        console.log('[ConfigManager] Arquivo não existe, criando novo:', filePath);
      }

      // Atualiza apenas [git-commit]
      if (!settings['[git-commit]']) {
        settings['[git-commit]'] = {};
      }
      const gitCommitConfig = settings['[git-commit]'] as Record<string, unknown>;
      gitCommitConfig['editor.language'] = config.language;
      gitCommitConfig['editor.rulers'] = [config.maxLength];
      gitCommitConfig['editor.conventionalCommit'] = config.conventionalCommit;
      gitCommitConfig['editor.conventionalPattern'] = config.conventionalPattern;
      gitCommitConfig['editor.includeBranch'] = config.includeBranch;

      // Escreve de volta ao arquivo com formatação legível
      const jsonContent = JSON.stringify(settings, null, 2);
      console.log('[ConfigManager] Escrevendo arquivo com conteúdo:', jsonContent);
      fs.writeFileSync(filePath, jsonContent, 'utf-8');

      // Gera o arquivo copilot-instructions.md
      await this.generateCopilotInstructions(config);

      console.log('[ConfigManager] Configuração salva com sucesso em:', filePath);
      
      // Oferece a opção de recarregar a janela para o Copilot reconhecer as novas instruções
      vscode.window.showInformationMessage(
        'Configurações salvas! Recarregue a janela para que o Copilot reconheça as novas instruções.',
        'Recarregar Agora'
      ).then((selection) => {
        if (selection === 'Recarregar Agora') {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[ConfigManager] Erro ao salvar configuração:', error);
      vscode.window.showErrorMessage(
        `Erro ao salvar configurações: ${errorMsg}`
      );
      return false;
    }
  }

  /**
   * Remove as configurações do arquivo .vscode/settings.json
   */
  static async clearConfig(): Promise<boolean> {
    const filePath = this.getConfigFilePath();
    if (!filePath || !fs.existsSync(filePath)) {
      return false;
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const settings = JSON.parse(fileContent);
      delete settings[this.CONFIG_KEY];

      fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
      console.log('[ConfigManager] Configuração removida com sucesso');
      return true;
    } catch (error) {
      console.error('[ConfigManager] Erro ao remover configuração:', error);
      return false;
    }
  }

  /**
   * Gera o arquivo .github/copilot-instructions.md com instruções de commit
   */
  private static async generateCopilotInstructions(config: CommitConfig): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      console.log('[ConfigManager] Nenhuma pasta de workspace encontrada para gerar copilot-instructions');
      return;
    }

    const githubDir = path.join(workspaceFolders[0].uri.fsPath, '.github');
    const instructionsFile = path.join(githubDir, 'copilot-instructions.md');

    try {
      // Garante que a pasta .github existe
      if (!fs.existsSync(githubDir)) {
        console.log('[ConfigManager] Criando diretório:', githubDir);
        fs.mkdirSync(githubDir, { recursive: true });
      }

      // Determina o idioma para as instruções
      const language = config.language === 'pt' ? 'português' : 'inglês';
      const isPortuguese = config.language === 'pt';

      // Template das instruções
      const instructionsContent = isPortuguese ? `# Instruções para Copilot - Geração de Mensagens de Commit

## Padrão Obrigatório: Conventional Commits

Todas as mensagens de commit devem seguir o padrão **Conventional Commits** com escopo.

### Formato
\`\`\`
tipo(escopo): descrição
\`\`\`

### Tipos Permitidos
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alterações na documentação
- **style**: Formatação, semicolons, pontos e vírgulas (sem alteração de código)
- **refactor**: Refatoração de código sem alteração de funcionalidade
- **perf**: Melhoria de performance
- **test**: Adição ou atualização de testes
- **chore**: Atualizações de dependências, configurações, scripts de build
- **ci**: Alterações em CI/CD

### Escopo (Obrigatório)
Indique o contexto/módulo afetado:
- \`auth\`, \`config\`, \`git\`, \`validator\`, \`ui\`, \`wizard\`, etc.

### Descrição
- Sempre em **português brasileiro**
- Comece com verbo no infinitivo ou imperativo
- Máximo **${config.maxLength} caracteres** na primeira linha
- Sem período final
- Conciso e descritivo

### Exemplos Corretos
- \`feat(validator): adicionar validação de escopo de commits\`
- \`fix(git): corrigir erro ao gerar mensagem de commit\`
- \`refactor(wizard): simplificar lógica do assistente interativo\`
- \`docs(readme): atualizar instruções de instalação\`
- \`chore(deps): atualizar dependências do projeto\`
- \`test(validator): adicionar testes unitários para validação\`

### Exemplos Incorretos ❌
- \`update stuff\` (vago, não segue padrão)
- \`feat: adicionado novo recurso\` (falta escopo)
- \`fix(git): Corrigir erro ao gerar mensagens de commit com mais de ${config.maxLength} caracteres.\` (muito longo, tem ponto)

## Contexto do Projeto

Este é um **extension do VS Code** que padroniza mensagens de commit usando Conventional Commits com um wizard interativo no Source Control.

### Módulos Principais
- **extension**: Arquivo principal de entrada
- **commitWizard**: Assistente interativo para criação de commits
- **configManager**: Gerenciamento de configurações
- **configPanel**: Painel de configuração
- **validator**: Validação de mensagens de commit
- **git**: Integração com Git

## Regras Especiais

1. Ao descrever mudanças de **configuração**, use o escopo \`config\`
2. Ao descrever mudanças de **validação**, use o escopo \`validator\`
3. Ao descrever mudanças da **UI/UX**, use o escopo \`ui\` ou \`wizard\`
4. Ao descrever alterações de **integração Git**, use o escopo \`git\`

## Instruções para IA

- Gere mensagens **claras e objetivas**
- Respeite o limite de **${config.maxLength} caracteres** na primeira linha
- Use **sempre português brasileiro**
- Escolha o **tipo e escopo mais apropriado** para o contexto das mudanças
- Se houver múltiplas mudanças em escopos diferentes, gere commits **separados**
` : `# Copilot Instructions - Commit Message Generation

## Mandatory Pattern: Conventional Commits

All commit messages must follow the **Conventional Commits** pattern with scope.

### Format
\`\`\`
type(scope): description
\`\`\`

### Allowed Types
- **feat**: New functionality
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting, semicolons, commas (no code changes)
- **refactor**: Code refactoring without functionality changes
- **perf**: Performance improvement
- **test**: Test addition or update
- **chore**: Dependency updates, configurations, build scripts
- **ci**: CI/CD changes

### Scope (Required)
Indicate the affected context/module:
- \`auth\`, \`config\`, \`git\`, \`validator\`, \`ui\`, \`wizard\`, etc.

### Description
- Always in **English**
- Start with verb in infinitive or imperative
- Maximum **${config.maxLength} characters** on the first line
- No final period
- Concise and descriptive

### Correct Examples
- \`feat(validator): add commit scope validation\`
- \`fix(git): fix error when generating commit message\`
- \`refactor(wizard): simplify assistant logic\`
- \`docs(readme): update installation instructions\`
- \`chore(deps): update project dependencies\`
- \`test(validator): add unit tests for validation\`

### Incorrect Examples ❌
- \`update stuff\` (vague, does not follow pattern)
- \`feat: added new feature\` (missing scope)
- \`fix(git): Fix error when generating commit messages with more than ${config.maxLength} characters.\` (too long, has period)

## Project Context

This is a **VS Code extension** that standardizes commit messages using Conventional Commits with an interactive wizard in Source Control.

### Main Modules
- **extension**: Main entry point
- **commitWizard**: Interactive wizard for creating commits
- **configManager**: Configuration management
- **configPanel**: Configuration panel
- **validator**: Commit message validation
- **git**: Git integration

## Special Rules

1. When describing **configuration** changes, use the \`config\` scope
2. When describing **validation** changes, use the \`validator\` scope
3. When describing **UI/UX** changes, use the \`ui\` or \`wizard\` scope
4. When describing **Git integration** changes, use the \`git\` scope

## Instructions for AI

- Generate **clear and objective** messages
- Respect the **${config.maxLength} character** limit on the first line
- Use the appropriate language consistently
- Choose the **most appropriate type and scope** for the context of changes
- If there are multiple changes in different scopes, generate **separate commits**
`;

      // Escreve o arquivo
      fs.writeFileSync(instructionsFile, instructionsContent, 'utf-8');
      console.log('[ConfigManager] Arquivo copilot-instructions.md gerado com sucesso em:', instructionsFile);
    } catch (error) {
      console.error('[ConfigManager] Erro ao gerar copilot-instructions.md:', error);
      // Não lança erro para não interromper o fluxo de salvamento
    }
  }
}

