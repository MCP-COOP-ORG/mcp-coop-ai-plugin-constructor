---
name: Frontend
description: Standard engineering skills and patterns for frontend.
---

# Frontend

## Angular Development Standards

### Preferred Folder Hierarchy & Architecture

- `src/app/pages/`: Routable "Smart" container components that connect the router to the layout.
- `src/app/components/`: Feature-level components representing specific workflow steps (e.g., SetupStep, ReviewStep). They encapsulate step-specific business logic.
- `src/app/services/`: Core business logic layer and state management.
- `src/app/shared/`: Purely presentational "Dumb" UI elements, pipes, custom form controls, directives, models, and constants.
- `src/app/shared/models/`: Central TypeScript interfaces and type definitions.
- `src/app/shared/constants/`: Dictionaries and static text (Zero Literals Enforcement).
- `src/app/shared/utils/`: Helper functions like DOM manipulation and Type Guards.
- `public/`: All static files, JSON dictionaries, and images MUST be placed here; NEVER use the legacy `src/assets` folder.

### General & Typescript

- Use strict type checking and avoid the `any` type; use `unknown` when type is uncertain.
- Prefer type inference when the type is obvious.
- Keep components and services small and focused on a single responsibility.

### Architecture & CLI

- **STRICT CLI GENERATION:** ALL Angular entities (components, services, pipes, directives) MUST be generated strictly using the Angular CLI (`npx ng generate`). Manual creation of entity files via `write_to_file` or `cat` is strictly prohibited.
- Use **standalone components** exclusively — `NgModules` are prohibited.
- Must **NOT** set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use `inject()` function for dependency injection — **NEVER** use constructor-based DI.
- Use `providedIn: 'root'` for singleton services.
- Implement lazy loading for feature routes via `loadComponent()` with dynamic `import()`.

### Components & State (Signals)

- Manage component state exclusively with **Angular Signals** (`signal()`, `computed()`, `effect()`).
- Keep state transformations pure and predictable. Do **NOT** use `mutate` on signals; use `update` or `set` instead.
- **NEVER** use RxJS `BehaviorSubject` for component-level state or `ngOnInit` for logic that can be expressed as a `computed()` signal.
- Use `input()`, `output()`, and `model()` signal-based APIs instead of decorators.
- Enforce `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- Do **NOT** use `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead.

### Templates & UI

- Keep templates simple and avoid complex logic. Prefer inline templates for small components.
- When using external templates/styles, use paths relative to the component TS file.
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Do **NOT** use `ngClass` or `ngStyle`; use `class` and `style` bindings instead.
- Use the `async` pipe to handle observables in templates.
- Do not assume globals like `new Date()` are available in templates.
- Use `NgOptimizedImage` for all static images (note: does not work for inline base64 images).
- Prefer Reactive forms instead of Template-driven ones. Implement custom form controls via `ControlValueAccessor` — **NEVER** pass `FormControl` references down the component tree.

### Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## TypeScript Development Standards

- Enable `strict: true` in `tsconfig.json` — this includes `strictNullChecks`, `noImplicitAny`, and `strictFunctionTypes`.
- **NEVER** use `any` — use `unknown` for untyped values, then narrow with type guards.
- **NEVER** use unsafe type assertions (`as Type`) — use runtime narrowing (`typeof`, `instanceof`, custom type guards).
- Use `readonly` for properties and parameters that should not be mutated after initialization.
- Prefer `interface` for object shapes and `type` for unions, intersections, and mapped types.
- Use discriminated unions with a literal `type` field for state machines and polymorphic data.
- Configure path aliases (`@shared/...`, `@services`) and enforce them via linter — **NEVER** use deep relative imports (`../../..`).
- Use `as const` for literal objects and arrays that represent fixed configurations.
- Prefer `Record<K, V>` over `{ [key: string]: V }` for index signatures.
