# Gemini Agent System Rules & Context

You are an expert AI assistant working on the **MCP COOP AI Plugin Constructor** project.

## Core Documentation Rules

Do NOT guess architectural decisions or tech stack configurations. Instead, read the highly specific documentation in the `docs/` folder depending on your current task:

- **Architecture & Code Standards**: Read `docs/architecture.md` (Contains rules for Signals, Standalone Components, Zero Literals Policy, View Model Pattern, and folder structure).
- **Project Concept & Roadmap**: Read `docs/concept.md` to understand the business logic, what we are building, why, and what the future steps are.
- **Current Context & History**: Read `docs/context.md` to understand what has already been built, the current state of the application, and the history of recent changes.

## Documentation Update Policy (IMPORTANT)

**CRITICAL RULE: NEVER update `docs/context.md` proactively during development. You must ONLY modify the context file when the user EXPLICITLY commands you to "commit", "save progress", or "update docs" at the very end of a fully completed task.**

When the explicit command is given:

1. You MUST update `docs/context.md`. Add a new entry at the top of the `Development History` list (descending order) detailing the new features implemented and architectural changes made.
2. If fundamental architectural rules or roadmap steps changed, update `docs/architecture.md` and `docs/concept.md` accordingly to keep the global context perfectly synced.

## Agent Behavior & Workflow

1. **MANDATORY PRE-FLIGHT CHECK (NO GUESSING)**: BEFORE writing any UI/CSS code, you MUST execute `mcp_taiga-ui_get_overview` or `mcp_taiga-ui_get_component_example`. BEFORE writing any Angular logic, you MUST execute `mcp_angular-cli_get_best_practices` or `mcp_angular-cli_search_documentation`. If you propose an implementation plan or write code without executing these MCP tools first in the current session, you are violating core directives.
2. **Planner Mode First**: Do not generate code, files, or artifacts autonomously. Always analyze the request, run the Pre-Flight Check via MCP tools, and agree on a plan before execution.
3. **Use IDE Artifacts**: Always formulate your steps through the IDE's built-in artifacts (`implementation_plan.md`, `task.md`). Present the plan for user approval before touching source code.
4. **Step-by-Step Execution**: Work systematically. Execute one logical step at a time, asking for verification.
5. **Ask, Don't Guess**: If there is any ambiguity about libraries, architecture, state structure, or terminology, stop and ask the user.
6. **CSS & Markup Integrity Check**: Before finalizing UI changes, autonomously verify strict adherence to BEM, `:host` encapsulation, and the Zero Literals Policy across both HTML and SCSS files.
7. **Federation Cache Recovery**: If Angular build or Native Federation throws inexplicable syntax/404 errors during local development, assume cache poisoning. Immediately clear `.angular/cache` and restart the server before attempting to debug phantom code errors.

## Hard Lessons Learned & Strict Prohibitions (Internalized from Past Mistakes)

1. **NO LINTER CRUTCHES**: Absolutely NO `eslint-disable` or `eslint-disable-next-line` comments allowed. All linting and TypeScript errors MUST be fixed "honestly" at the root cause (e.g., using `() => undefined` instead of empty blocks, properly linking `<label for>` to `<textarea id>`, strictly typing `any` to `unknown` or specific generics).
2. **TRUE CONFIGURATION-DRIVEN UI**: When building "Zero Literals" components, the TS logic and Reactive Forms MUST be 100% agnostic. Never hardcode `switch-case` checks or form control keys. Use `Array.reduce()` and dynamic loops to guarantee the UI gracefully handles any array mutations (swaps, additions, deletions) without breaking.
3. **NO CSS HACKS (Truncations)**: Do not use cheap layout hacks like `text-overflow: ellipsis` to hide UI problems. Content should dictate the container. Use proper layout mechanics (e.g., `flex-shrink: 0`, `flex-wrap: wrap`) to allow elements to flow logically without cutting off user data.
4. **TESTS ARE FIRST-CLASS CITIZENS**: Never treat tests as an afterthought or ignore failing specs during a refactor. If you change dynamic logic, you must immediately update the `.spec.ts` files to validate that specific dynamic behavior (e.g., testing that the form dynamically generates the exact number of controls as the config array). Falling below the 85% global coverage threshold (Lines/Functions/Statements/Branches) is a strict architecture violation.
5. **MODERN ANGULAR STATIC ASSETS (v18+)**: NEVER use the legacy `src/assets` folder. All static files (templates, JSON dictionaries, icons) MUST be placed inside the `public/` directory. The modern `@angular/build:application` builder only serves and copies files from the `public/` folder by default, so using `src/assets` will cause 404 HttpErrorResponse crashes in production.
6. **STRICT CLI GENERATION**: ALL Angular entities (components, services, pipes, directives) MUST be generated strictly using the Angular CLI (`npx ng generate`). Manual creation of entity files via `write_to_file` or `cat` is strictly prohibited. The CLI ensures proper imports, configurations, and adherence to workspace schematics.
