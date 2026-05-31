---
name: Tooling
description: Standard rules and conventions for tooling.
trigger: always_on
---

## ESLint Standards

- Use ESLint flat config (`eslint.config.js`) for modern, consolidated configuration.
- **NO LINTER CRUTCHES**: Absolutely NO `eslint-disable` or `eslint-disable-next-line` comments allowed. All linting and TypeScript errors MUST be fixed "honestly" at the root cause (e.g., using `() => undefined` instead of empty blocks, properly linking `<label for>` to `<textarea id>`, strictly typing `any` to `unknown` or specific generics).
- Enforce strict boundaries and dependency rules using plugins (e.g., preventing cross-module imports).
- Configure ESLint to run automatically on save in the IDE and via pre-commit hooks.
- Resolve all linter warnings — treat them as errors in the CI pipeline.

## Prettier Standards

- Use Prettier as the absolute authority on code formatting — disable all ESLint rules that conflict with Prettier.
- Provide a project-root `.prettierrc` configuration file to ensure identical formatting across all IDEs and environments.
- Configure Prettier to format on save in the IDE.
- Enforce formatting on staged files using `lint-staged` before commits are allowed.
- **NEVER** manually format code to bypass Prettier's output.

## Husky & Git Hooks

- Use Husky to enforce quality gates on the developer's machine before code reaches the remote repository.
- Configure a `pre-commit` hook that runs formatting, linting, and type-checking on staged files (via `lint-staged`).
- **NEVER** bypass hooks (`git commit --no-verify`) unless resolving complex merge conflicts.
- Keep hooks fast — only run checks on modified files, not the entire codebase, during the pre-commit phase.

## Vitest Configuration

- Define explicit coverage thresholds in `vitest.config.ts` (Lines, Branches, Functions, Statements) and fail the build if they are not met.
- Group tests using `describe` blocks logically, and use `beforeEach`/`afterEach` for setup and teardown to ensure test isolation.
- Run tests in watch mode (`vitest --watch`) during active development for immediate feedback.
- Use Vitest's UI (`vitest --ui`) for easier debugging and visualization of coverage reports.
- Configure path aliases in Vitest to match TypeScript configuration (`tsconfig.json`).

## TESTS ARE FIRST-CLASS CITIZENS

- Never treat tests as an afterthought or ignore failing specs during a refactor.
- If you change dynamic logic, you must immediately update the `.spec.ts` files to validate that specific dynamic behavior (e.g., testing that the form dynamically generates the exact number of controls as the config array).
- Falling below the 85% global coverage threshold (Lines/Functions/Statements/Branches) is a strict architecture violation.
