---
name: Basic-rules
description: Standard rules and conventions for basic-rules.
trigger: always_on
---

## Code Readability

- Optimize for vertical reading: keep line lengths reasonable and group related logic together without excessive whitespace.
- Use descriptive, intention-revealing names even if they are long. `calculateTotalTaxAmount` is better than `calcTax`.
- Avoid negative conditionals where positive ones are possible (e.g., use `isEnabled` instead of `isNotDisabled`).
- Format complex boolean expressions across multiple lines, or extract them into named variables.
- Keep indentation shallow. If a function is nested 3 or 4 levels deep, extract inner logic.

## Error Handling

- **NEVER** swallow exceptions silently with empty `catch` blocks.
- Use a centralized `GlobalErrorHandler` to intercept unhandled exceptions and display standardized user-facing toasts.
- Throw domain-specific custom errors rather than generic `Error` objects to allow precise handling.
- Return meaningful, localized error messages to the user without exposing stack traces or internal system details.
- Distinguish between expected operational errors (e.g., validation failure, network timeout) and unexpected programmer errors (bugs).

## Naming Conventions

- Use `camelCase` for variables, functions, properties, and methods.
- Use `PascalCase` for classes, interfaces, type aliases, and components.
- Use `UPPER_SNAKE_CASE` for constants, environment variables, and dictionary objects.
- Use `kebab-case` for file names and directory names (e.g., `user-profile.component.ts`).
- Prefix boolean variables and functions returning booleans with `is`, `has`, `should`, `can`, or `will`.
- Use imperative verbs for function names (e.g., `calculateTotal`, `fetchData`, not `total` or `data`).
