# Current Project Context & History

## General Context

The MCP COOP AI Plugin Constructor is a standalone web application built with Angular 21 and Taiga UI. It uses a dual-build architecture: standalone mode (default, optimized) via `@angular/build:application`, and an optional micro-frontend mode via `@angular-architects/native-federation:build` (accessible through `npm run build:federation`). The builder uses a 3-step workflow (Setup, Stack, Review) with Lucide icons on the TuiStepper. All form steps are implemented strictly adhering to the Zero Literals and View Model patterns.

## Development History

### Commit (Pending): feat: refactor archive structure to native plugin format and integrate Cursor lifecycle hooks

**Status:** Completed
**Key Features Implemented:**

- **Native Plugin Architecture**: Transitioned the generated archive format to the official native plugin specs for Antigravity, Claude Code, and Cursor.
    - **Antigravity**: Relocated rules and skills into `.agents/plugins/[plugin]/` with a manifest `plugin.json` in the plugin root. Workflows remain at workspace-level `.agents/workflows/`.
    - **Claude Code**: Rules and workflows remain at workspace-level `.claude/rules/`. Mapped agents as skills inside the `[plugin]/skills/` directory with a manifest `[plugin]/.claude-plugin/plugin.json`.
    - **Cursor**: Relocated rules, workflows (compiled with `.mdc` extension), and skills (agents) inside the `[plugin]/` directory with a manifest `[plugin]/.cursor-plugin/plugin.json`.
- **Archive Naming & Placeholders**: Updated the generated ZIP name to use the project name (`<project-name>.zip` instead of `ai-context.zip`). Centralized dynamic `[plugin]` placeholder resolution in `ArchiveGenerator` before strategy dispatch.
- **Review Step UI Adjustments**: Expanded the review sidebar width by 1.5 times (from `18rem` to `27rem`) to prevent long nested plugin path truncation. Replaced the static header and tree root folder names with the dynamically derived project name (`<project-name>.zip` in uppercase for the header, and lowercase for the root folder).
- **Full Cursor Hooks Integration**:
    - Mapped all 12 existing hook categories to native Cursor events (e.g. `sessionStart`, `preToolUse`, `postToolUse`, `afterFileEdit`).
    - Added native `"cursor"` configuration blocks (commands and matchers) to all 8 standard hook files (`direnv-load.json`, `env-guard.json`, etc.).
    - Created 9 new Cursor-specific hook categories (such as shell/MCP execution hooks, file read guards, workspace open, and tab edits) under `public/assets/pages/hooks/` with metadata (`_meta.json`) and fallback sample json configs.
- **Quality Assurance**: Regenerated all pages configs, ran code formatter, and successfully passed all linting (`ng lint`), typechecking (`tsc --noEmit`), and Vitest unit tests (100% pass rate: 208/208, with global coverage >91.4% Statements, >88% Branches, >85% Functions, and >95% Lines).

### Commit (Pending): fix: strictly enforce Zero Literals in project identity form and eliminate any types from tests

**Status:** Completed
**Key Features Implemented:**

- **Plugin Configuration Context**: Renamed the root step block to "Plugin Configuration" while retaining "Project Name" and "Project Identity" for the inner form inputs. This logically aligns the builder UI to collect user project context while building the actual plugin.
- **HTML Description Formatting**: Migrated descriptions in `step-header` to use `[innerHTML]` instead of interpolation, enabling native HTML rendering for emphasis tags (`<strong>`) to highlight core phrases in builder steps.
- **Strict Typing Compliance**: Eliminated all `any` usages from `input-field.spec.ts` and `textarea-field.spec.ts` by defining a rigorous `MockNgControl` interface with strictly typed `ValidationErrors`.
- **Test Coverage Validation**: Maintained the mandatory 85%+ global coverage metrics. Function coverage restored to `85.24%` by triggering native `statusChanges.subscribe` callbacks directly within the mocked ControlValueAccessor tests.

### Commit (Pending): refactor: rebrand project to MCP COOP AI Plugin Constructor

**Status:** Completed
**Key Features Implemented:**

- **Project Rebranding:** Renamed all user-facing instances of the application to "MCP COOP AI Plugin Constructor". Updated the HTML `<title>` tag, PWA web manifest (`name` and `short_name`), and welcome page text (titles, descriptions, highlights in `builder-dictionary.ts`).
- **Technical Name Preservation:** Kept the technical name `agent-builder` / `mcp-coop-agent-builder` intact for configs, folder names, Nginx SPA paths, and Native Federation identifiers to ensure zero regression.
- **Documentation Alignment:** Updated branding references in `Gemini.md`, `README.md`, `CONTRIBUTING.md`, `docs/concept.md`, and all sub-module guide files (`src/README.md`, etc.). Corrected path links in `src/README.md`.

### Commit (Pending): fix: resolve duplicate basic categories and review step active node styling

**Status:** Completed
**Key Features Implemented:**

- **UI Active Node Regression**: Fixed the active node styling in `review-step.scss`. Removed the background color and updated the text color to the primary brand accent (`var(--tui-text-action)`) with bold typography to maintain visual consistency in the IDE layout.
- **Generator Context Overwrite Fix**: Addressed a critical bug in `ArchiveGenerator` where categories with identical IDs across different builder pages (e.g., `basic` in Rules and `basic` in Workflows) were overwriting each other during the flat context merge (`...dynamicContext`). Renamed the underlying assets to `basic-rules` and `basic-workflows` and regenerated `generated-pages-config.ts` to guarantee unique state mapping.
- **Antigravity Schema Isolation**: Fixed a misconfiguration in `antigravity.ts` where the `agents` category array was inadvertently merged into the `rules` generation path. Strict separation is now enforced, preventing skills from leaking into the `.agents/rules/` directory.

### Commit (Pending): fix: update html title and meta description for SEO and rebranding

**Status:** Completed
**Key Features Implemented:**

- **SEO & Branding Update**: Updated `index.html` title to "MCP COOP Agentic Workspace Builder" to align with project rebranding. Rewrote the meta description to a concise, professional, and SEO-friendly format ("Visual builder to configure and generate custom AI Agent rules...").

### Commit (Pending): feat: standardize AI agent instruction architecture and optimize builder UX

**Status:** Completed
**Key Features Implemented:**

- **Core Directives System**: Created `src/app/shared/constants/core-directives.ts` to host a standardized, high-priority "Agent Mindset" instruction block. Injected `core_directives` globally into all generated templates via `ArchiveGenerator`.
- **Domain Specification Refactoring**: Renamed "Business Domains" to "Domain-Specific Rules" across all UI components, dictionaries, and JSON templates (`claude.json`, `cursor.json`, `antigravity.json`). Updated `ArchiveGenerator` logic to process domain rules as a collection joined by newlines.
- **Template Normalization**: Standardized the `## Domain-Specific Rules` and `## Core Directives` headers within the platform JSON content blocks, stripping out legacy hardcoded path instructions to rely on platform-native discovery patterns.
- **Granular Builder Documentation**: Rewrote configuration step descriptions across all builder pages (`agents`, `hooks`, `rules`, `workflows`, `project`, `review`). Each description now provides concise context on its purpose and exactly where its output is injected in the final ZIP bundle.
- **Description UI Enhancements**: Implemented `white-space: pre-line` formatting in `step-header.scss` to allow CSS to natively respect line breaks. Updated all `_meta.json` descriptions to split sentences with `\n`, drastically improving scannability in the UI without modifying core layout components. Regenerated the `generated-pages-config.ts` schema to lock in these updates.

### Commit (Pending): feat: v0.1.0 open source readiness, contribution graph, and architecture overhaul

**Status:** Completed
**Key Features Implemented:**

- **v0.1.0 Release & Rebranding**: Bumped project version to `0.1.0` in `package.json` and `README.md`. Rebranded the descriptive titles to "MCP COOP Agentic Workspace Builder". Rewrote the root `README.md` to highlight production readiness (Standalone PWA, Docker, Nginx).
- **Automated Formatting & Validation**: Installed `lint-staged` and configured a `.prettierrc` (4 spaces tab width, single quotes, lf end of line). Updated `.husky/pre-commit` to strictly run `npm run format` globally, followed by `npx lint-staged` and typechecks, guaranteeing zero-debate code styles on every PR.
- **Open Source Contribution Graph**: Created a root `CONTRIBUTING.md` serving as an entry point. Implemented a distributed guide architecture in `docs/contributing/` with individual instructions for `platforms.md`, `agents.md`, `rules.md`, `workflows.md`, `hooks.md`, and `description.md`.
- **Architecture Documentation Overhaul**: Completely rewrote `docs/architecture.md` into an exhaustive technical manual. Documented the Dual-Build strategy, File-System Driven Configuration, Recommendation Engine mechanisms, Zero Literals SSOT, and a detailed `src/app` directory map.

### Commit (Pending): feat(ui): disable PWA and enhance StepLayout sidebar with search and scroll

**Status:** Completed
**Key Features Implemented:**

- **PWA/Service Worker Disabled**: Disabled the Angular Service Worker via feature flag in `app.config.ts` and removed `ngsw-config.json` from `angular.json` build targets to prevent chunk loading errors on new deployments.
- **Enhanced Sidebar Layout**: Updated `StepLayout` to include a dynamic search input (min 2 chars) for filtering sidebar tabs, reusing the Zero Literals search logic and minimum length constants from dropdown fields.
- **Sidebar UX Improvements**: Added a count of items next to the sidebar title. Limited the sidebar height to 10 items with a custom scrollbar (`var(--sidebar-max-items, 10)`).
- **CSS Formatting**: Implemented `text-overflow: ellipsis` for tab text via a nested `.tab-text` span as an explicit exception to the CSS Hacks rule. Reduced font size to `0.75rem`, adjusted left padding to `0.5rem !important`, and increased sidebar column width to `240px` (originally requested 260px, later adjusted by user) for better readability.
- **Conditional Sidebar Rendering**: Added logic to completely hide the sidebar and collapse the CSS Grid to 1 column (`no-sidebar` class) if there is only 1 category or fewer.

### Commit `57195ab`: feat: implement default prompts system with preselection and recommended badge

**Status:** Completed
**Key Features Implemented:**

- **Default Prompts Architecture**: Extended `ConfigCategory` and `BuilderBlockConfig` interfaces with an optional `default?: boolean` flag. Categories marked as default automatically preselect all their items in the form on load.
- **Preselection Logic**: Updated `BaseFormStep.ngOnInit()` to detect `block.default === true` and initialize checkbox `FormControl` values with all option IDs instead of an empty array. Reset functionality restores these defaults.
- **Recommended Badge UI**: Added an orange `recommended` badge to `BuilderBlock` via a new `isDefault` input signal. Styled with `hsl(30, 100%, 50%)` background using a BEM modifier (`builder-block__tag--recommended`), visually distinct from the blue environment tags.
- **Generator Propagation**: Updated `generate-pages-config.ts` to read and propagate the `default` flag from `_meta.json` into `GENERATED_PAGES_CONFIG`.
- **Default Content**: Created two default categories:
    - `rules/basic` — 3 items: code-readability, error-handling, naming-conventions
    - `workflows/basic` — 4 items: init-agent, planning, brainstorm, orchestrator
- **Test Coverage**: Added unit tests for recommended badge rendering (visible when `isDefault=true`, absent otherwise) and default preselection behavior (all items checked on init). Coverage remains above 85% across all metrics.

### Commit (Pending): perf: implement dual-build strategy and frontend performance optimization

**Status:** Completed
**Key Features Implemented:**

- **Dual-Build Architecture**: Implemented a switchable build system using Angular CLI configurations. `npm run build` / `npm start` now produce a standalone application using `@angular/build:application` with direct bootstrap (`main.standalone.ts`), bypassing federation overhead. `npm run build:federation` / `npm run start:federation` preserve the full Native Federation mode for future micro-frontend integration.
- **Image Optimization**: Converted hero image from PNG (730 KB) to WebP (268 KB). Added `<link rel="preload">` to `index.html` for immediate LCP resource discovery.
- **Nginx Compression & Cache Strategy**: Enabled gzip compression (level 6) for all text-based assets. Implemented granular Cache-Control: `immutable` for hashed assets, `no-cache` for `remoteEntry.json` and Service Worker files.
- **Service Worker Prefetch Split**: Refactored `ngsw-config.json` from a "prefetch everything" strategy to a split: lightweight `app-shell` (prefetch) for core CSS/JS, and `federation-shared` (lazy) for 250+ federation chunks.
- **Performance Impact**: Standalone build produces 6 initial JS files (318 KB gzipped) vs federation's 259 separate chunks. HTTP requests reduced from ~520 to ~15-20. Build time reduced from ~10s to ~6s. `es-module-shims` polyfill (37 KB) eliminated from standalone builds.

### Commit (Pending): feat: add docker build and github actions deploy configuration

**Status:** Completed
**Key Features Implemented:**

- **Standalone Web App Dockerization**: Created a multistage `Dockerfile` to build the Agent Builder as a standalone SPA using `@angular/build:application`. Included Nginx configuration (`nginx.conf`) for proper SPA routing (`try_files`) and static asset caching.
- **GitHub Actions Deployment**: Implemented `.github/workflows/deploy.yml` CI/CD pipeline using Google Cloud Workload Identity Federation (WIF). The workflow builds the Docker image, pushes it to Google Artifact Registry (GAR), and deploys it to the VM via SSH.
- **Docker Compose Configuration**: Added `.github/deploy/docker-compose.prod.yml` to define the `agent-builder-webapp` service connected to the `mcp-network`.
- **Platform Integration Prep**: Aligned deployment structure with the existing monorepo patterns (similar to Unbogi) to allow the main platform Nginx to reverse-proxy traffic to `/agent-builder/`.

### Commit (Pending): feat(ui): refine badge branding, implement user-only preset filtering, and modernize date formats

**Status:** Completed
**Key Features Implemented:**

- **Refined Badge Branding**: Implemented a high-contrast visual identity for `tuiBadge` components. Overrode library defaults in `themes.scss` to use the primary brand blue (`--tui-background-accent-1`) with white text. Increased visual footprint by 30% and moved badges to the right-hand corner of builder headers for improved hierarchy.
- **Dynamic Content Injection**: Added a `# ` prefix to badges via HTML interpolation in `builder-block.html`, providing a more recognizable "tag" aesthetic without CSS pseudo-element overhead.
- **User-Only Preset Filtering**: Refactored `PresetManager` to include a `userPresets` computed signal. This separates persistent user data from static system templates, resolving a bug where system presets appeared in management interfaces.
- **Preset Dialog Modernization**:
    - **Date Formatting**: Transitioned to an American-style abbreviated month format (`d MMM yyyy`, e.g., "15 May 2026").
    - **Layout Optimization**: Relocated the date metadata next to the delete icon for a cleaner, action-oriented row structure.
- **Architecture & Quality**:
    - Eliminated all `any` usage in `PresetDialog` unit tests, ensuring full compliance with the project's strict typing policy.
    - Achieved 100% CI pass rate (192/192 tests) and clean linting.

### Commit (Pending): feat(ui): add environment compatibility tags and descriptive subtitles to lifecycle hooks

**Status:** Completed
**Key Features Implemented:**

- **Environment Compatibility Tags**: Implemented visual badges using `TuiBadge` next to hook category titles. These tags represent AI environments (e.g., `antigravity`, `claude`) that support the specific hook, driven by the `events` dictionary in the configuration.
- **Descriptive Hook Subtitles**: Added a `description` field to all 20+ hook category metadata files (`_meta.json`). These descriptions are rendered as subtitles under each category title to provide immediate context on when the hook fires.
- **Architectural Data Flow**: Extended `BuilderBlockConfig` and `ConfigCategory` interfaces to include `events` and `description` properties. Updated `scripts/generate-pages-config.ts` to automatically propagate these new metadata fields into the generated UI configuration.
- **Enhanced UI Components**:
    - **`BuilderBlock`**: Added support for rendering badges and subtitles with appropriate typography (`tui-text_body-s`) and BEM-compliant styling.
    - **`StepLayout`**: Updated the dynamic block loop to pass the new metadata down to the block components.
- **Quality Assurance**: Added unit tests to `builder-block.spec.ts` to verify the correct rendering of both tags and subtitles. Achieved 100% CI pass rate (192/192 tests, clean linting).

### Commit (Pending): test: achieve 85%+ global branch coverage and stabilize dynamic builder components

**Status:** Completed
**Key Features Implemented:**

- **Global Coverage Milestone**: Successfully surpassed the mandatory 85% threshold across all metrics: **Statements (91.73%), Branch (89.7%), Functions (86.28%), and Lines (95.55%)**. This ensures full architectural stability for the configuration-driven builder.
- **Select Fields Hardening**: Added comprehensive unit tests for `SelectField` and `MultiSelectField` covering asynchronous `onSearch` filtering, `showInfo` dialog triggers for documentation previews, and strict `ControlValueAccessor` behavior validation.
- **Archive Strategy Stabilization**: Remediated coverage gaps in `DynamicCategoryStrategy`, `DynamicItemStrategy`, and `DynamicHookStrategy`. Added tests for deep JSON interpolation, fallback platform templates, and automated glob inclusion.
- **Review Step UI Testing**: Improved HTML/Component coverage by directly triggering UI actions (`redoEdit`, `setEnvironment`, `onEditorChange`) and verifying the "Empty State" rendering when no files are generated.
- **Mock Optimization**: Standardized the use of `vi.spyOn` and strictly typed mocks for `TemplateInterpolator` and `DialogManager`, resolving intermittent race conditions during dynamic asset loading in the JSDOM environment.

### Commit (Pending): fix: eliminate vitest test bleed via sessionStorage and global config isolation

**Status:** Completed
**Key Features Implemented:**

- **Global Config Isolation**: Fixed a critical test bleed in `dynamic-form-step.spec.ts` where mocking the global `GENERATED_PAGES_CONFIG` without an `afterAll` cleanup caused downstream tests in `archive-strategies.spec.ts` to incorrectly resolve `wrapperType` fallbacks (`test-step` instead of `workflow`).
- **SessionStorage Sterilization**: Fixed a secondary test bleed in `checkbox-group.spec.ts` by introducing `sessionStorage.clear()` in the `beforeEach` hook. This ensures `BuilderState` initializes cleanly without loading residual state (like `aiAgent: 'antigravity'`) from previous test suites running in the shared JSDOM environment.
- **Coverage Safety**: Restored full stability to the test suite, achieving 100% passing tests (174/174) with global coverage remaining safely above the strict 85% thresholds across Lines, Branches, Functions, and Statements.

### Commit (Pending): feat(ui): add github stars widget to header via shields.io

**Status:** Completed
**Key Features Implemented:**

- **Robust GitHub Stars Integration**: Replaced the unreliable third-party `ghbtns.com` iframe widget (which suffered from aggressive GitHub API rate limiting) with a native, transparent SVG implementation via `img.shields.io`. This guarantees 100% uptime through Cloudflare caching and perfect transparency in dark mode via `filter: invert(1)`.
- **Zero Literals Enforcement**: Removed legacy `DomSanitizer` logic and hardcoded URLs. Configured the new Shields.io URL directly via `BUILDER_DICTIONARY.header.githubShieldUrl`, strictly adhering to the project's view model pattern.
- **Content Security Policy (CSP) Updates**: Updated `index.html` by adding `https://img.shields.io` to the `img-src` directive, ensuring the native SVG renders without violating the strict PWA security policies.
- **Accessibility Fixes (a11y)**: Fixed lingering accessibility errors in the `PresetDialogComponent` by adding `tabindex="0"` and `(keydown.enter)` listeners to interactive SVG icons, keeping the codebase fully lint-compliant without using `eslint-disable`.

### Commit (Pending): feat: production readiness (PWA, CSP, Cache), UI refinements, and text formatting pipe

**Status:** Completed
**Key Features Implemented:**

- **Production Readiness**: Added `@angular/pwa` service worker caching, restrictive CSP, `GlobalErrorHandlerService`, and TTL invalidation for `@Memoize` to prevent stale data.
- **TextFormatPipe**: Built a standalone pipe with XSS protection to handle `\n` to `<br>` conversion and keyword highlighting.
- **Welcome UI/UX**: Switched to IBM Plex Mono, optimized widescreen layout (1200px), and refined AIDD copywriting.
- **Zero Literals & CI**: Extracted all new strings to `BUILDER_DICTIONARY`. 100% CI pass rate (lint, typecheck, >88% test coverage).

### Commit `eaa9f7e`: fix: remove .util extensions from shared utilities and stabilize archive strategy tests

**Status:** Completed
**Key Features Implemented:**

- **Test Environment Stabilization**: Migrated `ArchiveGenerator` and `TemplateInterpolator` tests away from fragile `fakeAsync`/`tick` dependencies that caused `zone.js/testing` missing environment errors. Refactored all asynchronous mocks to use clean `async`/`await` patterns.
- **Coverage Restoration**: Fixed the `archive-strategies.util.spec.ts` mocks that caused empty array assertions (`expected +0 to be 1`). Provided structurally correct mocked item keys (`eslint`) that correctly map to `ASSET_FILE_PATHS`, resolving branch logic coverage gaps. Achieved >85% branch, function, and line coverage.
- **Strict Naming Convention**: Removed redundant `.util.ts` extensions across the `src/app/shared/utils/` directory (`archive-strategies.ts`, `dom.ts`, `file-tree.ts`, `memoize.ts`). Updated the barrel export `index.ts` to reflect the cleaner module paths, eliminating unnecessary verbosity.
- **Zero Errors**: Ensured 100% test pass rate (160/160 tests), clean linting (`ng lint`), and clean typechecking (`tsc --noEmit`).

### Commit `8bda8a4`: feat: finalize browser-based preset management system via localStorage

**Status:** Completed
**Key Features Implemented:**

- **Centralized Preset Management**: Created `PresetService` to handle CRUD operations for AI configuration presets using `localStorage` and Angular Signals. Ensures maximum persistence and limits storage to the latest 10 presets.
- **Dynamic Select UI**: Developed `SelectField` component integrated into the dynamic form framework and updated `DESCRIPTION_BLOCKS` to populate a dynamic dropdown on the `DescriptionStep` page. Allows seamless loading and configuration population strictly following the Zero Literals Policy.
- **Review Step Dialog Extensibility**: Extracted the saving UI into `PresetDialogComponent`, triggered dynamically via Polymorpheus `TuiDialogService` upon hitting the download button in `ReviewStep`. This elegantly decouples form submission logic from the primary file tree interface.
- **Strict Quality Control and Full Coverage**: Fixed complex test cases related to Signal tracking, `TuiExpand` rendering, and vitest global DOM interactions. Replaced all `any` type-casting in test mocks with strictly typed `Preset` interfaces. Fixed `select-field` and `multi-select-field` specs: added `matchMedia` mock via `Object.defineProperty` for `provideTaiga()` compatibility in jsdom, replaced fragile `children[0]` DOM traversal with `By.directive()` queries. Achieved 100% pass rate (158/158 tests) and safely restored global coverage limits across all metrics (>85% function, branch, and line coverage).

### Commit (Pending): refactor: fully configuration-driven architecture, eliminate schema-categories.ts

**Status:** Completed
**Key Features Implemented:**

- **Dynamic Config Generation**: Extended `scripts/generate-pages-config.ts` to automatically generate `GENERATED_PAGE_CATEGORIES` and `GENERATED_AI_ENVIRONMENTS`, eliminating the need for hardcoded TypeScript arrays.
- **Wrapper Type Resolution**: Replaced static wrapper lookups in `ArchiveGenerator` with a dynamic approach that resolves `wrapperType` directly from the `_meta.json` file of each category page.
- **Platform Customization via JSON**: Shifted default template parameters (`trigger`, `globs`, `skillDescription`, `ruleDescription`, `workflowDescription`) into the `defaults` object of platform assets (`antigravity.json`, `claude.json`, `cursor.json`).
- **Zero Literals Enforcement**: Removed all hardcoded fallback strings from `ArchiveGenerator`. Fallbacks are either explicitly defined in the platform JSON or safely default to empty strings, fully adhering to the Zero Literals Policy.
- **Schema Simplification**: Replaced all hardcoded category arrays in `antigravity.ts`, `claude.ts`, and `cursor.ts` schemas with dynamic spreads from `GENERATED_PAGE_CATEGORIES`.
- **Cleanup & Tests**: Deleted `src/app/shared/constants/schema-categories.ts`. Ensured 100% test coverage (19/19 files, 133/133 tests) and clean linting across the entire project.

### Commit `f7a110f`: refactor: implement fully automated asset-driven architecture via DynamicFormStep

**Status:** Completed
**Key Features Implemented:**

- **Universal Form Step**: Created a single `DynamicFormStep` component to replace previously duplicated step components. It dynamically reads `stepId` from the active route and fetches its layout from `GENERATED_PAGES_CONFIG`.
- **Boilerplate Elimination**: Successfully deleted `agents-step`, `rules-step`, and `workflows-step` directories. Adding a new builder step is now fully automated and achieved purely by placing a JSON asset into `public/assets/pages/`.
- **Dynamic Routing & UI Registration**: Refactored `app.routes.ts` and `BUILDER_STEPS` to automatically iterate over `GENERATED_PAGES_CONFIG`, generating application routes and stepper navigation entries dynamically.
- **Dynamic State Management**: Transitioned `BuilderState` from static hardcoded signals to a reactive `dynamicData` map (`Record<string, WritableSignal>`), allowing infinite state persistence for generated steps.
- **Service Agnosticism**: Rewrote `ArchiveGenerator` and `RecommendationEngine` to recursively collect data from the `dynamicData` map instead of relying on hardcoded agent/rules/workflow dependencies, deeply coupling them to the Zero Literals architecture.
- **Strict Quality Control**: Fixed severe TypeScript errors (`TS7053`) and enforced strict typing across models by extending `PageConfig`. Achieved a fully clean linter and 100% test coverage (130/130 tests passing with global coverage at 95.66%).

### Commit `9e4a08e`: feat: add skill recommendation system with cross-page dependency tracking

**Status:** Completed
**Key Features Implemented:**

- **JSON Schema Extension**: Added `default` description key for fallback prompts and `recommendedWith`/`discouragedWith` string arrays to all 36 JSON assets across agents, rules, and workflows pages. The recommendation arrays reference item IDs cross-page (e.g., a backend skill can recommend a rules item).
- **RecommendationEngine Service**: New `Injectable({ providedIn: 'root' })` service at `src/app/services/recommendation-engine.ts`. Uses Angular `computed()` signals to reactively resolve recommendation status for all ConfigItems. Collects selected IDs from `BuilderState` (agents + rules + workflows) via functional `flatMap`/`filter`/`reduce` chains. Implements strict priority: **discouraged always wins over recommended** when conflicts arise. Selected items are excluded from the status map.
- **ConfigItem Interface Extension**: Added optional `recommendedWith?: string[]` and `discouragedWith?: string[]` to `ConfigItem` in `src/app/shared/models/pages-config.ts`.
- **Generator Script Update**: `scripts/generate-pages-config.ts` now reads each item JSON file and propagates `recommendedWith`/`discouragedWith` into `GENERATED_PAGES_CONFIG` via conditional spread.
- **CheckboxGroup UI Enhancement**: Added BEM modifiers `--recommended` (green via `--tui-status-positive`) and `--discouraged` (red via `--tui-status-negative`) with `color-mix()` backgrounds. Added info icon button (`@tui.info`) per option that opens a `TuiDialogService` modal (size `m`) showing the item's description with agent-specific fallback to `default`.
- **ArchiveGenerator Default Fallback**: Both `generateDynamicCategory` and `generateDynamicItem` methods now fall back to `description.default` when agent-specific description is missing (`description[agent] ?? description['default']`).
- **Full Test Coverage**: 134/134 tests passing. Coverage: Statements 92%, Branches 90%, Functions 86%, Lines 95%. `recommendation-engine.ts` at 100% across all metrics.

### Commit `45586e1`: refactor: modernize RxJS, enforce OnPush, decompose ArchiveGenerator, and extract shared utilities

**Status:** Completed
**Key Features Implemented:**

- **Performance Optimization (Phase 1)**: Integrated `ChangeDetectionStrategy.OnPush` across core UI components (`Welcome`, `Builder`, `BuilderBlock`, `StepHeader`) to improve rendering performance and conform to modern Angular standards.
- **RxJS and Dependency Cleanup (Phase 2)**: Replaced legacy `Subject` and `ngOnDestroy` logic with `takeUntilDestroyed(destroyRef)` in `BaseFormStep`. Removed the `HttpClient` dependency from `TemplateInterpolator` and migrated completely to the native `fetch()` API. Upgraded tests to use Vitest `globalThis.fetch` mocks natively.
- **DOM Boilerplate Elimination (Phase 3)**: Eliminated redundant HTML wrapper `div`s (e.g. `.welcome`, `.step-content`) in `welcome` and `step-header` components, cleanly migrating layout constraints and structural styling to the `:host` selector for true encapsulation.
- **SRP Architectural Breakdown (Phase 4)**: Decomposed the monolithic `ArchiveGenerator.generatePreview()` method into tightly-focused, strictly typed (`PlatformConfig`, `StaticFilePattern`, `DynamicCategoryPattern`, `DynamicItemPattern`) private helper methods (`generateStaticFile`, `generateDynamicCategory`, `generateDynamicItem`). Achieved 100% test passing while retaining strict types (`any` free) and zero `eslint-disable` directives.
- **Utility Extraction & Cleanup**: Extracted repetitive logic (`buildFileTree`, `triggerDownload`) into the `@shared/utils` barrel to eliminate "God files" and strictly adhere to DRY. Deleted the unused `RulesEngine` service and updated the documentation context to match the modern architecture.
- **PHP Agent Asset**: Added `php.json` to `public/assets/pages/agents/backend/` and re-generated `GENERATED_PAGES_CONFIG`.

### Commit `59439f4`: refactor: implement unified file-system driven agent configuration system

**Status:** Completed
**Key Features Implemented:**

- **Automated Config Generator**: Created `scripts/generate-pages-config.ts` that crawls `public/assets/pages/` to build a type-safe UI configuration tree.
- **Directory-Driven UI**: Eliminated hardcoded constants in favor of a file-system structure where adding a JSON file automatically adds a UI option.
- **Metadata Support**: Implemented `_meta.json` at page and category levels to define UI titles, icons, and input types (checkbox/radio).
- **Multi-Agent Asset Support**: Migrated assets to a new structure supporting multi-agent prompts (`claude`, `cursor`, `antigravity`) within a single JSON file.
- **Unified Platform Configuration**: Consolidated `MAIN` instructions and `TEMPLATES` into environment-aware JSON assets in `public/assets/platforms/`.
- **Generator Automation**: Updated `generate-pages-config.ts` to perform a recursive crawl of both `public/assets/pages/` and `public/assets/platforms/`, building a type-safe `GENERATED_PAGES_CONFIG`.
- **Legacy Schema Preservation**: Reverted all schema files (`antigravity.ts`, `claude.ts`, `cursor.ts`) to their original structure for backward compatibility, importing required configuration constants directly from `@shared/configs`.
- **Barrel Architecture**: Configured a dedicated `@shared/configs` barrel to allow for clean separation between generated and manual configuration files.
- **Archive Generator Update**: Refactored `ArchiveGenerator` to fetch agent-specific prompts from the new JSON structure dynamically based on the selected AI environment.
- **Zero Literals Compliance**: Integrated the generated config directly into `BUILDER_STEPS`, ensuring the entire builder remains strictly configuration-driven.
- **Architectural Cleanup**: Removed `templates.ts` and `schema-map.ts` in favor of direct imports and streamlined logic, successfully eliminating linting errors and improving type safety.
- **Strict Quality Assurance**: Achieved 100% passing tests (113/113) and resolved all "any" and linting violations in the test suite.

### Commit `ff33c18`: test: stabilize builder component tests and achieve 85%+ branch coverage

**Status:** Completed
**Key Features Implemented:**

- **Exhaustive Branch Coverage**: Achieved **89.57%** global branch coverage, surpassing the mandatory 85% threshold. Focused on covering complex template branches (`@switch`, `@case`, `@for`) and conditional logic in the `BaseFormStep`.
- **Step Component Stabilization**: Added comprehensive unit tests for `DescriptionStep`, `AgentsStep`, `RulesStep`, and `WorkflowsStep`. Implemented a mock-override pattern for `blocksArray` in tests to hit all possible dynamic form generation and rendering scenarios.
- **MultiSelectField Hardening**: Resolved coverage gaps in the `MultiSelectField` template (dropdown content and `ngModelChange` handler) by implementing interactive unit tests that simulate dropdown triggers and selection logic.
- **OnPush Change Detection Fixes**: Standardized the use of `fixture.debugElement.injector.get(ChangeDetectorRef).detectChanges()` and `await whenStable()` in unit tests to ensure `OnPush` components accurately reflect internal state changes during async test execution.
- **CVA Compliance**: Ensured all custom form components (`RadioGroup`, `MultiSelectField`) fully implement the `ControlValueAccessor` interface, including `setDisabledState`, to prevent runtime errors in integration scenarios.

### Commit `bfd1a71`: feat: add AppHeader with theme switcher and centralize Taiga UI theme customization

**Status:** Completed
**Key Features Implemented:**

- **AppHeaderComponent**: New standalone component (`src/app/shared/components/app-header/`) with `height: var(--app-header-height)` and `padding-inline: 1.25rem`. Placed above `<router-outlet>` in `app.html`. Contains a ghost icon button (`@tui.moon` / `@tui.sun`) in the right corner to toggle dark/light theme.
- **TUI_DARK_MODE Integration**: Injected `TUI_DARK_MODE` WritableSignal from `@taiga-ui/core` in both `AppHeader` and root `App` component. `[attr.tuiTheme]="darkMode() ? 'dark' : null"` is bound on `<tui-root>` — this is the official Taiga UI v5 pattern. LocalStorage persistence is handled automatically by Taiga UI via `TUI_DARK_MODE_KEY`.
- **Centralized Theme Customization** (`src/styles/themes.scss`): Single source of truth for all Taiga UI overrides. Loaded as a separate Angular `styles` entry in `angular.json` (after Taiga's own LESS files) to avoid SCSS `@use` ordering issues. Contains: typography tokens, `--app-header-height` layout token, spacing fallbacks, border-radius scale, light/dark accent color overrides (`[tuiTheme='dark']` selector).
- **CSS Layout Token** (`--app-header-height: 2.5rem`): Defined in `themes.scss :root`. Used in both `app-header.scss` and `builder.scss` (`calc(100vh - var(--app-header-height))`), ensuring the builder footer stays in viewport when the header is present.
- **Styles Architecture**: `styles.scss` is now a pure CSS reset with no Taiga UI specifics. All Taiga variables live in `themes.scss`. `body` color corrected from deprecated `--tui-text-01` to modern `--tui-text-primary`.
- **Linting**: Fixed pre-existing `for` loop lint error in `review-step.ts` (replaced with `for-of`). All files pass `ng lint`.
- **Test Coverage**: 5 unit tests for `AppHeader` (icon switching, toggle behavior). Updated `app.spec.ts` (removed stale title test, added header rendering test, fixed `eslint-disable` → `() => undefined`). 96/96 tests passing.
- **Notification Timing**: Reduced Review step notification `autoCloseMs` from 3000ms to 1500ms.

### Commit `95cf723`: refactor: implement schema-driven archive generator and dynamic tree vivification

**Status:** Completed
**Key Features Implemented:**

- **Schema-Driven Archive Generation**: Rewrote `ArchiveGenerator` into a dynamic constructor pattern. It now selects the platform schema (Antigravity, Claude, Cursor) based on the user's setup state and dynamically processes `static`, `dynamic-category`, and `dynamic-item` patterns instead of hardcoded paths.
- **JSON Template Assembly**: Transitioned templates from static Markdown files to structured JSON wrappers (`skill.json`, `antigravity.json`, etc.). Upgraded `TemplateInterpolator` to fetch these JSON structures and inject aggregated content directly into platform-specific Markdown shells.
- **Dynamic Context Flattening**: Enhanced `TemplateInterpolator` context mapping by flattening deeply nested reactive form states (e.g., merging `projectIdentity` fields into the root context), ensuring all template variables resolve correctly during archive generation.
- **Auto-Vivifying File Tree**: Fixed a UI bug where nested file paths rendered flat at the root level. Rewrote the `buildTree` logic in `ReviewStep` to dynamically parse file paths and auto-vivify (auto-create) nested folder nodes without relying on explicit `folder` entries from the schema.
- **Test Suite Modernization**: Updated the testing suite (`archive-generator.spec.ts` and `template-interpolator.spec.ts`) to align with the new JSON fetching logic, achieving a 100% test pass rate across the updated architecture.

### Commit `40be9fc`: refactor: rebrand project to MCP COOP Agent Builder and enforce Zero Literals

**Status:** Completed
**Key Features Implemented:**

- **Project Rebranding**: Renamed the application from 'shpakich-ai-agents-builder' to 'mcp-coop-agent-builder'. Updated technical identifiers in `package.json`, `angular.json`, `federation.config.js`, and `vitest.config.ts`.
- **Documentation Sync**: Updated human-readable titles and project references across all documentation files (`README.md`, `Gemini.md`, `docs/concept.md`, `docs/context.md`) to reflect the new MCP COOP Agent Builder brand.
- **Architectural Consistency**: Addressed a minor Zero Literals violation on the welcome page by ensuring text is strictly managed via `BUILDER_DICTIONARY`.
- **Codebase Alignment**: Performed comprehensive search-and-replace across source code (`src/app/`, `src/index.html`) to ensure the new name is consistently applied throughout the build pipeline and component layers.

### Commit `6f165d8`: feat: implement IDE Review Step, CodeMirror 6 integration, and 85%+ coverage

**Status:** Completed
**Key Features Implemented:**

- **Advanced IDE Review Interface**: Implemented a professional, VS Code-inspired IDE layout for the Review step. Integrated **CodeMirror 6** for syntax-highlighted editing and a **Taiga UI nested tree** for file browsing.
- **Robust State & Change Tracking**: Implemented a reactive `isDirty` flag and localized state management using Angular Signals. Edits are synchronized with the `ArchiveGenerator.previewFiles` signal, ensuring the final exported ZIP reflects user modifications.
- **Pixel-Perfect UI Standardization**: Enforced strict IDE-style aesthetics across the builder: fixed header heights (`2.75rem`), sharp corners (zero `border-radius`), and precise icon alignment. Implemented fallback CSS variables in `:root` to maintain layout stability during theme loading.
- **Comprehensive Test Coverage (>85%)**: Achieved over 85% coverage for both the `ReviewStep` and `CodeEditor` components. Resolved async initialization issues by mocking `matchMedia` and `afterNextRender`, and bypassed private property restrictions in tests through strictly-typed interface casting (eliminating all `any` usage).
- **Honest Linting & Type Safety**: Eliminated all `any` casts in the test suite and ensured zero lint violations without using `eslint-disable`. All UI strings and icons remain strictly managed via `BUILDER_DICTIONARY` (Zero Literals compliant).

### Commit `d0aaf3c`: feat: replace review static text with TuiNotificationService toast

**Status:** Completed
**Key Features Implemented:**

- Replaced hardcoded static text on the Review step with a `TuiNotificationService` toast that auto-appears via `afterNextRender()` and auto-closes after 3 seconds. All strings and the `autoCloseMs` timeout are stored in `BUILDER_DICTIONARY.notifications` (Zero Literals compliant). Updated `review-step.spec.ts` with `provideTaiga()` and a new test for notification strings.

### Commit `1a01164`: fix: perfect scroll-spy sidebar, strictly typed linters, and full session reset

**Status:** Completed
**Key Features Implemented:**

- **Scroll Sync & Anchor Navigation**: Rewrote the builder sidebar synchronization. Removed error-prone `window.scrollTo` in favor of native `element.scrollIntoView()` paired with CSS `scroll-margin-top`. Fixed a CSS Grid flaw (`align-items: start`) that previously collapsed the grid layout, restoring full `position: sticky` behavior to the Taiga UI sidebar.
- **Honest Linter Compliance**: Resolved 23 linter errors strictly without utilizing `eslint-disable`. Addressed all `any` casting in tests, replaced empty callbacks with `() => undefined`, and resolved `label-has-associated-control` template errors by implementing static ID counters in custom `ControlValueAccessor` fields.
- **Hard Session Reset**: Implemented a "Reset All" button in the footer with a clean Taiga UI flat-destructive aesthetic. The reset logic robustly clears `sessionStorage` and triggers a full router-level or window-level SPA redirect, guaranteeing complete clearance of residual reactive form states.
- **100% Passing Coverage**: Expanded unit tests in `builder.spec.ts` and `builder-state.spec.ts` to cover the new reset behavior, restoring the global project coverage safely above the required 85% threshold.

### Commit `4c31e7a`: feat: enforce 85% vitest coverage, harden CVA tests, and fix asset routing for ZIP generator

**Status:** Completed
**Key Features Implemented:**

- **Strict Vitest Coverage Enforcement**: Configured `vitest.config.ts` to strictly require >85% global coverage across Lines, Branches, Statements, and Functions. This rule physically blocks builds if untested UI logic is introduced.
- **ControlValueAccessor (CVA) Hardening**: Wrote comprehensive unit tests for all custom form components (`textarea-field`, `checkbox-group`, `radio-group`). Covered blind spots related to the default callbacks in `registerOnChange` and `registerOnTouched`, achieving an overall coverage of ~94% Lines.
- **Modern Angular Static Assets Routing**: Resolved a critical 404 bug affecting the `fflate` ZIP downloader. Moved the legacy `src/assets` folder to `public/assets` to comply with the modern Angular 18+ `@angular/build:application` structure, which only serves static files from the `public/` directory by default.
- **Archive Generation Finalization**: Stabilized the Builder's final step. The `fflate` engine now successfully intercepts the Builder State, iterates over the `ARCHIVE_SCHEMA`, handles hidden directories (e.g., `.agent`, `.cursor`), injects template strings, and triggers the browser's native download API for the final context zip.

### Commit `fe19c43`: refactor: strictly configuration-driven UI, zero eslint disables, and comprehensive form tests

**Status:** Completed
**Key Features Implemented:**

- **Dynamic Configuration-Driven Forms**: Refactored `SetupStep` and `StackStep` to iterate over arrays (`SETUP_BLOCKS`, `STACK_BLOCKS`) and dynamically build `FormGroup` structures via `Array.reduce`. This ensures 100% UI layout universality, permitting arbitrary reshuffling of config arrays without modifying component TS logic.
- **Strict Quality Assurance**: Installed `angular-eslint` via schematics and refactored code to eliminate all lint violations **without using a single `eslint-disable` comment**. Enforced strict typing across all custom `ControlValueAccessor` implementations (`RadioGroup`, `CheckboxGroup`, `TextareaField`).
- **Comprehensive Testing**: Wrote new unit tests covering the dynamic reactive form generation logic and validated user interactions within `RadioGroup` and `CheckboxGroup` via `ControlValueAccessor` implementations. The test suite passes fully (32/32 tests).
- **Flexbox Layout Optimization**: Migrated from a strict CSS grid to `display: flex; flex-wrap: wrap;` in `radio-group.scss` and `checkbox-group.scss`, preventing unwanted text wrapping and ensuring container widths natively fit the content.

### Commit `30a23d5`: refactor: enforce strict CSS layout encapsulation, BEM architecture, and Native Federation cache safety

**Status:** Completed
**Key Features Implemented:**

- **Component Encapsulation & Layout**: Refactored `builder-block` and `step-layout` to strictly use the `:host` selector for width/centering constraints (1200px max-width), eliminating redundant HTML wrapper `div`s. Replaced inappropriate semantic `<header>` tags in sub-components with generic `div`s.
- **BEM & SCSS Architecture**: Refactored component SCSS to adhere to BEM conventions (`__header`, `__icon`, `__title`) with SCSS nesting, replacing scattered and generic class names. Fixed visual hierarchy by scaling down sub-heading font sizes (`1.125rem`) and aligning icons with flexbox.
- **Zero Literals Policy (Templates)**: Extracted missed hardcoded labels (e.g., "Contents" in the Table of Contents) into the central `BUILDER_DICTIONARY.labels` and mapped them via the View Model.
- **Agent Workflow Directives**: Updated `docs/architecture.md` and `GEMINI.md` to introduce a mandatory CSS Integrity Check (validating `:host` encapsulation and BEM) and established a Cache Recovery protocol to handle Native Federation cache poisoning by auto-clearing `.angular/cache` via `npm run prestart`.

### Commit `9155358`: refactor: restructure builder from 4 steps to 3, add Lucide icons on stepper

**Status:** Completed
**Key Features Implemented:**

- **3-Step Workflow**: Consolidated 4 builder steps (Project, IDE, Stack, Export) into 3 logical steps: Setup (project + IDE), Stack (unchanged), Review (review + export). Deleted `project-step`, `ide-step`, `export-step` components; created `setup-step` and `review-step`.
- **Lucide Icons on Stepper**: Added `icon` field to `BuilderStep` interface and applied Taiga UI's `[icon]` input on `tuiStep` (`@tui.settings`, `@tui.layers`, `@tui.file-check`).
- **Download Button Icon**: Added `@tui.download` icon via `[iconEnd]` on the final step's Download button, with the icon constant stored in `BUILDER_DICTIONARY.icons`.
- **Zero Magic Numbers**: Replaced hardcoded step indices (`< 3`, `=== 2`) with data-driven expressions (`view.steps.length - 1`, `view.steps.length - 2`).
- **Test Fixes**: Fixed `app.spec.ts` (added `provideRouter`, `provideTaiga`, `matchMedia` mock for jsdom) and `welcome.spec.ts` (added `provideRouter`). All 21/21 tests passing.

### Commit `c6cb6ec`: refactor: enforce strict barrel architecture, fix Taiga UI typography, and strictly align AI prompt

**Status:** Completed
**Key Features Implemented:**

- **Strict Barrel Architecture**: Eliminated all `tsconfig.json` wildcard paths (`/*`) and the global `shared/index.ts` barrel. Replaced them with explicit sub-domain aliases (e.g., `@shared/constants`, `@shared/components`) to prevent Native Federation warnings, tree-shaking issues, and circular dependencies.
- **Taiga UI v4 Typography**: Fixed missing typography by migrating from deprecated CSS variables to the modern v4 `var(--tui-typography-family-text)` and `display` variables, globally applying JetBrains Mono.
- **UI Consolidation**: Centralized step headers into the standalone `StepHeaderComponent` utilizing Angular Signals (`input.required`) and explicitly bound `styleUrl` for proper SCSS encapsulation.
- **AI Rule Enforcement**: Updated `Gemini.md` with a strict `MANDATORY PRE-FLIGHT CHECK` mechanical rule, eliminating AI guessing by requiring mandatory MCP server usage (`mcp_taiga-ui_get_overview` / `mcp_angular-cli_search_documentation`) before any CSS/Angular logic is written.

### Commit `2e99c3e`: feat: implement builder navigation UI, zero literals policy, and vitest coverage

**Status:** Completed
**Key Features Implemented:**

- **Persistent Navigation Layout**: Developed a viewport-pinned footer with a dynamic `TuiStepper` and navigation buttons.
- **Reactive Router Sync**: Implemented `toSignal()` to synchronize the Stepper state with the current browser URL dynamically.
- **Zero Literals Enforcement**: Extracted all hardcoded UI labels, step definitions, and router paths into `@shared/constants` (e.g., `builder-dictionary.ts`, `builder-steps.ts`).
- **Clean Architecture Standards**: Implemented Barrel exports (`index.ts`) for constants and configured TypeScript path aliases (`@shared/*`). Grouped UI data into a highly cohesive `readonly view` object (View Model Pattern).
- **Test-Driven Safety**: Replaced default tests with a comprehensive Vitest suite covering router logic and step synchronization (100% passing).
- **Documentation**: Established formal enterprise architecture rules in `docs/architecture.md`, `docs/concept.md`, and `Gemini.md`.

### Commit `6102a72`: chore: setup initial builder architecture, routing, and AI context docs

**Status:** Completed
**Key Features Implemented:**

- Initialized core application structure.
- Set up basic placeholder routing for the Builder feature.
