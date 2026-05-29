# Application Architecture & Technical Guidelines

This document serves as the absolute source of truth for the project's architecture, design patterns, and internal mechanisms. It is designed to be read by both human contributors and AI agents to ensure strict adherence to the project's codebase standards.

---

## 1. High-Level Technology Stack

- **Framework:** Angular 21+ (Strictly Standalone Components, no `NgModules`).
- **State Management:** Angular Signals (Strictly no `NgRx`, no `RxJS` Subjects for state).
- **UI Library:** Taiga UI 5.x.
- **Micro-Frontend Architecture:** `@angular-architects/native-federation`.
- **Client-Side ZIP Generation:** `fflate`.
- **Code Editor:** CodeMirror 6.
- **Testing:** Vitest & JSDOM (Strictly enforced >85% global coverage).
- **Production Infrastructure:** Docker, Nginx, Google Cloud Workload Identity Federation, PWA.

---

## 2. Core Architectural Mechanisms (How it Works)

The Builder is a 100% Client-Side Rendered (CSR) application with no backend logic. Its primary mechanism is a **Configuration-Driven Dynamic Form** that generates context files based on JSON assets.

### A. File-System Driven Configuration

We do not hardcode UI steps or options in TypeScript. The entire builder UI is dynamically generated based on the contents of the `public/assets/` directory.

1. The script `scripts/generate-pages-config.ts` runs at build time (`npm run generate:pages`).
2. It crawls `public/assets/pages/` (agents, rules, workflows, hooks) and `public/assets/platforms/` (cursor, claude, etc.).
3. It generates a type-safe TypeScript configuration file (`GENERATED_PAGES_CONFIG`).
4. The application routing and `DynamicFormStep` component iterate over this configuration to render the Stepper, tabs, checkboxes, and radio buttons dynamically.

### B. State Management (`BuilderState`)

Instead of a massive monolithic state object, the application state is completely reactive and dynamic.

- The `BuilderState` service maintains a `dynamicData: Record<string, WritableSignal<string[]>>` map.
- As the user navigates through dynamically generated pages, the state dynamically allocates Signals for new form controls.
- This ensures **Granular Reactivity**: changing an option in "Backend" only triggers updates for the "Backend" UI block, not the entire application.

### C. Recommendation Engine (Cross-Page Dependency Tracking)

The `RecommendationEngine` is a reactive service that ensures logical consistency across user selections.

- JSON assets can define `recommendedWith: ["id"]` or `discouragedWith: ["id"]`.
- Using Angular `computed()` signals, the engine constantly evaluates the `BuilderState`.
- If a selected Backend agent (e.g., `nestjs`) recommends an Architectural rule (e.g., `hexagonal`), the UI instantly highlights the Hexagonal Architecture option in green (`--tui-status-positive`).
- **Conflict Resolution Priority:** Discouraged (red) always wins over Recommended (green).

### D. Archive Generation (`ArchiveGenerator` & `TemplateInterpolator`)

When the user clicks "Download" on the Review Step, the application must compile all selected options into a single archive.

1. `ArchiveGenerator` reads the active platform (e.g., `cursor`) from the `BuilderState`.
2. It loads the platform's specific schema from `public/assets/platforms/cursor.json`.
3. It iterates over the selected IDs in `BuilderState.dynamicData`.
4. `TemplateInterpolator` fetches the JSON snippets for each ID, processes platform-specific overrides, and injects the raw markdown strings into the platform's master template using `{{ dynamicCategory }}` tokens.
5. `fflate` compresses the generated strings into a `.zip` blob in memory and triggers a native browser download.

---

## 3. Strict Development Rules & Design Patterns

### The Zero Literals Policy (SSOT)

Absolutely **NO hardcoded UI strings, dictionary keys, or router paths** are allowed in components, HTML templates, or services.

- All static texts, labels, tooltips, and notification messages MUST be exported as constants from `src/app/shared/constants/builder-dictionary.ts`.
- Components must bind these constants via the View Model.

### The View Model Pattern

Do not pollute the component TypeScript class with scattered variables used only in the template.

- Group all UI-bound static data into a single `readonly view = { ... }` object to maximize cohesion and keep the class clean.

### Component Encapsulation & BEM

- **CSS Architecture:** Strictly enforce the BEM (Block, Element, Modifier) methodology combined with SCSS nesting (e.g., `&__header`, `&--recommended`). Generic class names are strictly forbidden.
- **Encapsulation:** Utilize the `:host` selector for all component-level layout boundaries (margins, max-width, flexbox display logic) to eliminate redundant HTML wrapper elements like `<div class="container">`.

### Honest TypeScript & Linting

- **No Linter Hacks:** Absolutely NO `eslint-disable` or `@ts-ignore` comments are allowed.
- All linting and TypeScript errors MUST be fixed at the root cause.
- Use `unknown` instead of `any`. Ensure custom form controls strictly implement `ControlValueAccessor`.
- **Zero Inline Types:** Inline object type definitions with 2+ properties are strictly prohibited. All such domain-specific interfaces and type aliases must be declared under `src/app/shared/models/`.
- **Safe Type Narrowing:** Avoid unsafe type casting/assertions (`as string`, `as string[]`, `as Record<...>`). Enforce safe type narrowing using custom Type Guards (e.g., `isStringArray`, `isNavigationEnd`).
- All code is automatically formatted by **Prettier** (`npm run format`) during the pre-commit hook.

### Dual-Build Strategy

The application has two parallel build targets defined in `angular.json`:

1. **Standalone Mode (`npm run build`):** Uses `@angular/build:application`. This builds the application as an independent, optimized SPA, completely removing Micro-Frontend overhead. This is the **primary production target**.
2. **Federation Mode (`npm run build:federation`):** Uses `@angular-architects/native-federation`. This builds the application as a remote module that can be seamlessly injected into host platforms.

---

## 4. Directory Structure Map

```text
src/
├── app/
│   ├── pages/               # Routable "Smart" container components (Welcome, Builder, NotFound). They connect the router to the layout.
│   ├── components/          # "Dumb" UI feature blocks representing specific workflow steps (SetupStep, ReviewStep, DynamicFormStep).
│   ├── services/            # Core business logic layer (BuilderState, ArchiveGenerator, RecommendationEngine, PresetService).
│   ├── shared/              # Reusable UI elements, pipes, custom form controls (RadioGroup, MultiSelect), models, and constants.
│   │   ├── models/          # Central TypeScript interfaces and type definitions (e.g., PageConfig, BuilderStep, SelectOption).
│   │   ├── constants/       # builder-dictionary.ts, builder-steps.ts (Zero Literals Enforcement).
│   │   └── utils/           # Helper functions (DOM manipulation, FileTree generation, Type Guards).
│   ├── app.config.ts        # Global application configuration (Providers, Router, Taiga UI init).
│   └── app.routes.ts        # Application routing rules.
├── styles/                  # Global CSS variables, resets, and Taiga UI theme customizations (themes.scss).
└── index.html               # Main entry point.

public/
├── assets/
│   ├── pages/               # JSON snippets defining the steps, categories, and prompt data (agents, rules, workflows, hooks).
│   ├── platforms/           # JSON files defining the structure and default templates for target IDEs (Cursor, Windsurf).
│   └── images/              # Static media assets (e.g., hero image).
```
