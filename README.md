# # My Commit

Extensão para VS Code que padroniza mensagens de commit usando o padrão [Conventional Commits](https://www.conventionalcommits.org/) com um wizard interativo.

## Funcionalidades

- **Wizard interativo** no painel Source Control para criar mensagens de commit passo a passo
- **Validação em tempo real** na barra de status enquanto você digita a mensagem
- **Tipos configuráveis** — use os tipos padrão ou personalize para o seu projeto
- **Scopes configuráveis** — defina os scopes do projeto para seleção rápida

## Formato suportado

```
type(scope)!: descrição curta

corpo opcional

footer opcional / BREAKING CHANGE
```

**Tipos padrão:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## Como usar

1. Abra o painel **Source Control** (`Ctrl+Shift+G`)
2. Clique no ícone `$(git-commit) My Commit` no topo do painel
3. Siga os passos do wizard
4. A mensagem é inserida automaticamente no campo de commit

## Configurações

| Configuração | Tipo | Padrão | Descrição |
|---|---|---|---|
| `myCommit.types` | `string[]` | `[]` | Sobrescreve os tipos padrão |
| `myCommit.scopes` | `string[]` | `[]` | Scopes pré-definidos do projeto |
| `myCommit.showStatusBar` | `boolean` | `true` | Mostra validação na status bar |

### Exemplo de configuração no `settings.json`

```json
{
  "myCommit.scopes": ["auth", "api", "ui", "database", "ci"],
  "myCommit.showStatusBar": true
}
```

## Licença

MIT