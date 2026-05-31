# Application Architecture & Technical Guidelines

This document serves as the absolute source of truth for the project's architecture, design patterns, and internal mechanisms. It is designed to be read by both human contributors and AI agents to ensure strict adherence to the project's codebase standards.

---

## 1. High-Level Technology Stack

- **Framework:** Angular 21.2+ (Strictly Standalone Components, no `NgModules`).
- **State Management:** Angular Signals (Strictly no `NgRx`, no `RxJS` Subjects for state).
- **UI Library:** Taiga UI 5.5.
- **Micro-Frontend Architecture:** `@angular-architects/native-federation`.
- **Client-Side ZIP Generation:** `fflate`.
- **Code Editor:** CodeMirror 6.42.
- **Testing:** Vitest & JSDOM (Strictly enforced >85% global coverage).
- **Static Analysis & Tooling:** ESLint, Prettier, and Husky enforce strict linting, formatting, and the Zero-Literals policy during pre-commit hooks.
- **Production Infrastructure:** Docker, Nginx, Google Cloud Workload Identity Federation, PWA.

---

## 2. Core Architectural Mechanisms (How it Works)

The Builder is a 100% Client-Side Rendered (CSR) application with no backend logic. Its primary mechanism is a **Configuration-Driven Dynamic Form** that generates context files based on JSON assets.

### A. File-System Driven Configuration

We do not hardcode UI steps or options in TypeScript. The entire builder UI is dynamically generated based on the contents of the `public/assets/` directory.

1. The script `scripts/generate-pages-config.ts` runs at build time (`npm run generate:pages`).
2. It crawls `public/assets/pages/` (agents, rules, workflows, hooks) and `public/assets/platforms/` (antigravity, claude, cursor).
3. It generates a type-safe TypeScript configuration file (`GENERATED_PAGES_CONFIG`).
4. The application routing and `DynamicFormStep` component iterate over this configuration to render the Stepper, tabs, checkboxes, and radio buttons dynamically.

### B. State Management (`BuilderState` & Managers)

Instead of a massive monolithic state object, the application state is completely reactive and modular.

- **`BuilderState`**: Maintains a `dynamicData: Record<string, WritableSignal<string[]>>` map. As the user navigates through dynamically generated pages, the state dynamically allocates Signals for new form controls. This ensures **Granular Reactivity**: changing an option in "Backend" only triggers updates for the "Backend" UI block.
- **`PresetService`**: Serializes current `BuilderState` into JSON configurations and saves/restores them.
- **`DialogManager`**: Orchestrates modals and contextual overlays dynamically.
- **`GlobalErrorHandler`**: A centralized error boundary required for intercepting exceptions and displaying standardized toasts.

### C. Recommendation Engine (Cross-Page Dependency Tracking)

The `RecommendationEngine` is a reactive service that ensures logical consistency across user selections.

- JSON assets can define `recommendedWith: ["id"]` or `discouragedWith: ["id"]`.
- Using Angular `computed()` signals, the engine constantly evaluates the `BuilderState`.
- If a selected Backend agent (e.g., `nestjs`) recommends an Architectural rule (e.g., `hexagonal`), the UI instantly highlights the Hexagonal Architecture option in green (`--tui-status-positive`).
- **Conflict Resolution Priority:** Discouraged (red) always wins over Recommended (green).

### D. Archive Generation (`ArchiveGenerator` & `TemplateInterpolator`)

When the user clicks "Download", the application compiles all selected options into a single archive.

1. `ArchiveGenerator` reads the active AI Environment from the `BuilderState`.
2. It loads the platform's specific `ArchivePattern` schema from `src/app/shared/schemas/` (e.g., `antigravity.ts`, `claude.ts`).
3. It iterates over the selected IDs in `BuilderState.dynamicData`.
4. `TemplateInterpolator` fetches the JSON snippets for each ID, processes platform-specific overrides from `public/assets/platforms/`, and injects raw strings into the master template.
5. **Core Directives Injection**: `TemplateInterpolator` also injects the Single Source of Truth string defined in `src/app/shared/constants/core-directives.ts` replacing the `{{ core_directives }}` placeholder.
6. `fflate` compresses the generated files into a `.zip` blob in memory and triggers a native browser download.

### E. Deep Dive: Dynamic Forms & Reactive State

The core complexity of the application lies in how it seamlessly translates raw file-system JSON assets into a fully functional, stateful, and reactive form without hardcoding UI logic.

#### 1. Universal Routing & `DynamicFormStep`

Instead of creating a dedicated Angular Component for every single step (e.g., `AgentsComponent`, `RulesComponent`), the application uses a single universal `DynamicFormStep`.

- **Route Interception:** The component uses `ActivatedRoute` to extract the `stepId` from the route snapshot.
- **View Model Construction:** It dynamically builds a `readonly view` object by querying `GENERATED_PAGES_CONFIG[stepId]`. It strictly filters the generated categories and items based on the `visibility` flags defined in the original JSON schemas.
- **Performance:** By using `ChangeDetectionStrategy.OnPush`, the step only re-renders when the specifically bound reactive Signal triggers an update, bypassing unnecessary DOM checks.

#### 2. Dynamic State Allocation (`BuilderState`)

To avoid the performance bottlenecks of a massive monolithic state tree, `BuilderState` utilizes a dynamic allocation strategy.

- **Pre-Allocation:** During initialization, the service iterates over `Object.keys(GENERATED_PAGES_CONFIG)` and explicitly pre-allocates a `WritableSignal<Record<string, unknown>>` for _every_ configured page.
- **Direct Binding:** When a `DynamicFormStep` is instantiated, it maps its internal `stateSignal` directly to its pre-allocated slice: `this.builderState.dynamicData[this.stepId]`.
- **Granular Reactivity:** This isolation guarantees that clicking a checkbox on the "Rules" page only triggers reactivity for the "Rules" UI tree. It prevents cross-contamination of change detection cycles across the app.

#### 3. State Persistence (The Memento Pattern)

The application ensures that user sessions survive accidental refreshes using a reactive implementation of the Memento pattern.

- **Auto-Serialization:** An Angular `effect()` is established inside `BuilderState`. Whenever _any_ underlying signal mutations occur, the effect seamlessly serializes the entire dynamic state map into a `BuilderSnapshot` and commits it to `sessionStorage`.
- **SSR Safety Guard:** The storage API calls are strictly shielded behind `isPlatformBrowser(this.platformId)` to prevent server-side rendering crashes and maintain maximum compatibility.

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
│   ├── pages/               # Routable "Smart" container components (Welcome, Builder, NotFound).
│   ├── components/          # "Dumb" UI feature blocks representing specific workflow steps.
│   ├── services/            # Core logic (BuilderState, ArchiveGenerator, RecommendationEngine, PresetService, DialogManager).
│   ├── shared/              # Reusable UI elements, pipes, models, schemas, and constants.
│   │   ├── schemas/         # ArchivePattern schemas dictating ZIP structures (antigravity.ts, claude.ts).
│   │   ├── models/          # Central TypeScript interfaces and type definitions.
│   │   ├── constants/       # builder-dictionary.ts, core-directives.ts (Zero Literals Enforcement).
│   │   └── utils/           # Helper functions (DOM manipulation, FileTree generation, Type Guards).
│   ├── app.config.ts        # Global application configuration (Providers, Router, Taiga UI init).
│   └── app.routes.ts        # Application routing rules.
├── styles/                  # Global CSS variables, resets, and Taiga UI theme customizations.
└── index.html               # Main entry point.

public/
├── assets/
│   ├── pages/               # JSON snippets defining steps, categories, and prompt data (agents, rules).
│   ├── platforms/           # Master JSON definitions for target IDE platforms (antigravity.json, claude.json, cursor.json).
│   └── images/              # Static media assets (e.g., hero image).
```
