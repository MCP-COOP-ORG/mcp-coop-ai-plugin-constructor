---
name: Code-quality
description: Standard rules and conventions for code-quality.
trigger: always_on
---

## Strict Typing Enforcement

- Enable all strict mode flags in `tsconfig.json` (`strictNullChecks`, `noImplicitAny`, etc.).
- **NEVER** use the `any` type. If the shape is unknown, use `unknown` and apply runtime type guards.
- **NEVER** use unsafe type casting (`as MyType`). Instead, use type predicates (`is MyType`) that validate the data at runtime.
- Use `readonly` arrays and properties by default to prevent accidental mutations.
- Define comprehensive interfaces for all external API boundaries and domain entities.
- Avoid optional properties (`?`) when the absence of a value implies a distinct state — use discriminated unions instead.

## Zero Literals Policy (SSOT)

- **NEVER** hardcode user-facing text, error messages, or configuration values directly in UI components or templates.
- Extract all literals into a Single Source of Truth (SSOT), such as a centralized dictionary object (e.g., `BUILDER_DICTIONARY`).
- Define UI structures (forms, steps, navigation) via configuration arrays rather than hardcoding DOM elements.
- This pattern ensures the codebase is fully internationalization-ready (i18n) and permits global copy changes without touching component logic.

## TRUE CONFIGURATION-DRIVEN UI

- When building "Zero Literals" components, the TS logic and Reactive Forms MUST be 100% agnostic.
- Never hardcode `switch-case` checks or form control keys.
- Use `Array.reduce()` and dynamic loops to guarantee the UI gracefully handles any array mutations (swaps, additions, deletions) without breaking.

## View Model Pattern

- Consolidate all UI-bound data (dictionaries, configurations, computed states) into a single, cohesive `readonly view` object within the component.
- Expose only the `view` object to the template, rather than polluting the component instance with numerous disparate properties.
- This pattern enforces strict separation between raw domain data and the shaped data required for rendering.
- Example: `readonly view = { title: DICT.title, steps: this.stepsSignal() };`.
