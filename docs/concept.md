# Application Concept: MCP COOP AI Plugin Constructor

## The Problem

Default AI assistant rules (such as a standard `.cursorrules` file or a generic system prompt for Gemini/Copilot) are too abstract. They lack specific context about the project's unique technology stack, architectural patterns (e.g., Hexagonal Architecture), and internal team coding conventions (e.g., a Zero Literals Policy). Because of this, developers waste significant time repeatedly correcting the AI and manually providing context in every chat session.

## The Solution

A visual web-based **Builder** that allows developers to seamlessly generate a perfect, project-specific AI context file in a few clicks:

1. **Setup**: Choose the target AI assistant or IDE, and define the business domain and core parameters of the project.
2. **Tech Stack**: Select the precise technologies used (Frontend, Backend, Database) with smart dependency validation.
3. **Review & Export**: Review the full configuration and generate the final context archive for download.

## Key Features

- **Smart Rules Engine**: A dependency-aware configuration graph. The engine ensures logical consistency—for example, if a developer selects Angular, it will restrict the selection of React-specific libraries; if NestJS is selected alongside Hexagonal Architecture, it automatically includes specific port/adapter rules for the AI.
- **Client-Side Generation**: 100% frontend-driven. The application has no backend, ensuring maximum privacy and instant feedback. Archives and prompt files are generated entirely in the user's browser.
- **Micro-Frontend Architecture**: Built from the ground up as a Native Federation Micro-Frontend (MFE), designed to be seamlessly embedded into the overarching MCP COOP Platform ecosystem.

## Development Roadmap & Strategy

To build this visual Builder correctly, we follow a strict sequential plan. Each step is designed to enforce the architecture and clean code standards.

### 1. State Management (`Builder State`)

- **Why:** The builder is a complex multi-step form. Instead of a monolithic object, we need isolated reactivity to avoid performance bottlenecks.
- **Plan:** Implement the state using individual, granular Signals for each step (Setup, Stack, Review) in `builder-state.ts`. This ensures only modified components re-render. No `localStorage` persistence is required initially.

### 2. Validation & Rules (`Rules Engine`)

- **Why:** To enforce the "Smart Rules Engine" concept without hardcoding logic into components.
- **Plan:** Externalize tech-stack configurations into static objects/files (e.g., `stack-rules.data.ts`). The `Rules Engine` service will consume these configs and evaluate them against the `Builder State` to validate user choices dynamically.

### 3. Core Shell & Navigation (`Builder Navigation UI`) - ✅ Completed

- **Why:** The user needs a persistent, intuitive way to navigate the workflow without losing context.
- **Plan:** Implement a globally pinned Stepper (using Taiga UI) at the bottom of the page, with dynamic "Forward" and "Back" routing. This shell serves as the container for the steps.

### 4. Form Steps (`Step Implementations`) - ✅ Completed

- **Why:** Each step in the "Solution" workflow needs a dedicated, highly focused UI component.
- **Plan:** Build out the UI for `setup-step`, `stack-step`, and `review-step`. The `review-step` includes a CodeMirror 6 editor and a nested file tree.
- **Constraint:** Keep these components _extremely thin_. They should only bind to the granular Signals in `builder-state.ts`, trigger service methods, and strictly follow the View Model Pattern and Zero Literals Policy (see `architecture.md`).

### 5. Advanced Template Interpolation - ✅ Completed

- **Why:** The basic string replacement in the generated context templates (e.g., `{{ projectName }}`) is too simple to support dynamic arrays, conditional tech-stack blocks, and nested architectural rules.
- **Plan:** Upgrade the `TemplateInterpolator` to support advanced parsing (e.g., lightweight Handlebars implementation or AST parsing) so the AI templates can intelligently loop through `backend` and `frontend` arrays, outputting rich, context-aware `.agent` and `.cursorrules` files.

### 6. CI/CD & Platform Integration - 🔄 Current Focus

- **Why:** To ensure the Builder remains stable and can be seamlessly consumed by the overarching MCP COOP Platform.
- **Plan:** Enforce the 85% Vitest threshold natively in GitHub Actions and integrate the Native Federation remote entry points with the host shell platform.
