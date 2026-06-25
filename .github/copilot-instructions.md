# Copilot Instructions - Commit Message Generation

## Mandatory Pattern: Conventional Commits

All commit messages must follow the **Conventional Commits** pattern with scope.

### Format
```
type(scope): description
```

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
- `auth`, `config`, `git`, `validator`, `ui`, `wizard`, etc.

### Description
- Always in **English**
- Start with verb in infinitive or imperative
- Maximum **149 characters** on the first line
- No final period
- Concise and descriptive

### Correct Examples
- `feat(validator): add commit scope validation`
- `fix(git): fix error when generating commit message`
- `refactor(wizard): simplify assistant logic`
- `docs(readme): update installation instructions`
- `chore(deps): update project dependencies`
- `test(validator): add unit tests for validation`

### Incorrect Examples ❌
- `update stuff` (vague, does not follow pattern)
- `feat: added new feature` (missing scope)
- `fix(git): Fix error when generating commit messages with more than 149 characters.` (too long, has period)

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

1. When describing **configuration** changes, use the `config` scope
2. When describing **validation** changes, use the `validator` scope
3. When describing **UI/UX** changes, use the `ui` or `wizard` scope
4. When describing **Git integration** changes, use the `git` scope

## Instructions for AI

- Generate **clear and objective** messages
- Respect the **149 character** limit on the first line
- Use the appropriate language consistently
- Choose the **most appropriate type** for the context of changes
- Choose the **most appropriate scope** for the context of changes
- If there are multiple changes in different scopes, generate **separate commits**
