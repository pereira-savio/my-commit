# My Commit

Extensão para VS Code que padroniza mensagens de commit usando o padrão [Conventional Commits](https://www.conventionalcommits.org/) com um painel de configuração interativo no Source Control. Integra-se automaticamente com o GitHub Copilot para gerar commits com base em suas regras customizadas.

## Funcionalidades

- **Painel de configuração** no Source Control para definir as regras de geração de commit
- **Suporte a idiomas** — gera mensagens em Português ou Inglês
- **Conventional Commit configurável** — ative ou desative o padrão, e escolha o padrão de escopo
- **Limite de caracteres** configurável para a primeira linha
- **Integração com GitHub Copilot** — gera automaticamente o arquivo `.github/copilot-instructions.md` com suas regras
- **Sincronização automática** — as configurações são salvas em `[git-commit]` do `settings.json`
- **Recarregamento facilitado** — oferece opção de recarregar a janela para o Copilot reconhecer as novas instruções

## Como usar

### 1. Abrir o Painel de Configurações

1. Abra o **Source Control** (`Ctrl+Shift+G` ou `Cmd+Shift+G`)
2. Clique no ícone de engrenagem (`⚙`) ou menu do painel
3. Procure por **"My Commit — Configurações"** ou clique no comando correspondente

### 2. Configurar as Regras

| Campo | Opções |
|---|---|
| **Idioma** | Português / English |
| **Ativar Conventional Commit?** | Sim / Não |
| **Padrão** *(visível quando Sim)* | `type(scope): descrição` ou `type: descrição` |
| **Máximo de caracteres** | número (padrão: 72) |
| **Referenciar branch?** | Sim / Não |

### 3. Salvar Configurações

- Clique em **Salvar** no painel
- As configurações são salvas em `.vscode/settings.json` → `[git-commit]`
- O arquivo `.github/copilot-instructions.md` é gerado automaticamente
- Uma mensagem oferece a opção de **"Recarregar Agora"** para o Copilot reconhecer as instruções

### 4. Usar o GitHub Copilot

Com as instruções geradas, você pode usar:
- `@command:github.copilot.git.generateCommitMessage` no VS Code
- O Copilot agora seguirá suas regras customizadas de commit

## Configurações Salvas

As configurações são armazenadas em `.vscode/settings.json` sob a chave `[git-commit]`:

```json
{
  "[git-commit]": {
    "editor.language": "pt",
    "editor.rulers": [72],
    "editor.conventionalCommit": true,
    "editor.conventionalPattern": "with-scope",
    "editor.includeBranch": false
  }
}
```

### Mapeamento de Campos

| Campo no Painel | Chave em `[git-commit]` | Tipo |
|---|---|---|
| Idioma | `editor.language` | `"pt"` \| `"en"` |
| Máximo de caracteres | `editor.rulers` | `number[]` |
| Conventional Commit | `editor.conventionalCommit` | `boolean` |
| Padrão | `editor.conventionalPattern` | `"with-scope"` \| `"without-scope"` |
| Referenciar branch | `editor.includeBranch` | `boolean` |

## Arquivo Copilot Instructions

Quando você salva as configurações, a extensão gera automaticamente:

📄 `.github/copilot-instructions.md`

Este arquivo contém:
- ✅ Instruções em Português ou Inglês (baseado na configuração)
- ✅ Tipos de commit permitidos
- ✅ Escopos recomendados
- ✅ Exemplos corretos e incorretos
- ✅ Limite de caracteres sincroni com sua configuração
- ✅ Contexto do projeto

O GitHub Copilot usa este arquivo para entender suas regras de commit!

## Fluxo Completo

```
┌─────────────────────────────┐
│ Abrir Painel de Configuração│
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ Configurar as Regras        │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ Clicar em Salvar            │
└──────────────┬──────────────┘
               │
     ┌─────────┴──────────┐
     │                    │
     ▼                    ▼
┌──────────────┐   ┌──────────────────────┐
│settings.json │   │copilot-instructions  │
│[git-commit]  │   │.md (gerado)          │
└──────────────┘   └──────────────────────┘
     │                    │
     └─────────┬──────────┘
               │
┌──────────────▼──────────────┐
│ Mensagem: "Recarregar Agora"│
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ VS Code Recarrega            │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ Copilot Reconhece Instruções │
└──────────────────────────────┘
```

## Licença

MIT

