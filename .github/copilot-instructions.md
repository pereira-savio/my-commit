# Instruções para Copilot - Geração de Mensagens de Commit

## Padrão Obrigatório: Conventional Commits

Todas as mensagens de commit devem seguir o padrão **Conventional Commits** com escopo.

### Formato
```
tipo(escopo): descrição
```

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
- `auth`, `config`, `git`, `validator`, `ui`, `wizard`, etc.

### Descrição
- Sempre em **português brasileiro**
- Comece com verbo no infinitivo ou imperativo
- Máximo **72 caracteres** na primeira linha
- Sem período final
- Conciso e descritivo

### Exemplos Corretos
- `feat(validator): adicionar validação de escopo de commits`
- `fix(git): corrigir erro ao gerar mensagem de commit`
- `refactor(wizard): simplificar lógica do assistente interativo`
- `docs(readme): atualizar instruções de instalação`
- `chore(deps): atualizar dependências do projeto`
- `test(validator): adicionar testes unitários para validação`

### Exemplos Incorretos ❌
- `update stuff` (vago, não segue padrão)
- `feat: adicionado novo recurso` (falta escopo)
- `fix(git): Corrigir erro ao gerar mensagens de commit com mais de 72 caracteres.` (muito longo, tem ponto)

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

1. Ao descrever mudanças de **configuração**, use o escopo `config`
2. Ao descrever mudanças de **validação**, use o escopo `validator`
3. Ao descrever mudanças da **UI/UX**, use o escopo `ui` ou `wizard`
4. Ao descrever alterações de **integração Git**, use o escopo `git`

## Instruções para IA

- Gere mensagens **claras e objetivas**
- Respeite o limite de **72 caracteres** na primeira linha
- Use **sempre português brasileiro**
- Escolha o **tipo e escopo mais apropriado** para o contexto das mudanças
- Se houver múltiplas mudanças em escopos diferentes, gere commits **separados**
