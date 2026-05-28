# Contributing to MCP COOP AI Plugin Constructor

First off, thank you for considering contributing to the MCP COOP AI Plugin Constructor! It's people like you that make this tool a powerful, community-driven resource.

This project is a 100% client-side, configuration-driven application. We heavily rely on JSON assets to generate context files for AI assistants. This means you don't even need to know Angular to contribute — you can add new AI platforms or context rules just by creating or editing JSON files!

## How to Contribute

We welcome contributions of all kinds, but the most common are:

1. **Adding new AI Agents/Platforms** (e.g., adding support for a new IDE).
2. **Adding new Tech Stack Snippets** (e.g., adding a new database or backend framework).
3. **Adding new Architecture Rules** (e.g., strict typing rules).
4. **Adding new Workflow Prompts** (e.g., code review steps).
5. **Adding new Agent Hooks** (e.g., new lifecycle events for agents).
6. **Adding new Project Descriptions** (e.g., new industry domains).

To make contributing as easy as possible, we have broken down the instructions based on the specific area you want to improve:

### 🧩 Contribution Guides

- **[Adding Platforms & IDEs](docs/contributing/platforms.md)**: Learn how to add a new AI Assistant or IDE to the Builder (e.g., adding support for a new tool alongside Cursor and Copilot).
- **[Adding Tech Stack Agents](docs/contributing/agents.md)**: Learn how to add new backend, frontend, or database technologies to the setup step.
- **[Adding Architecture Rules](docs/contributing/rules.md)**: Learn how to contribute global coding rules and standardizations.
- **[Adding Workflows](docs/contributing/workflows.md)**: Learn how to add new conversational workflows or AI commands.
- **[Adding Hooks](docs/contributing/hooks.md)**: Learn how to add new lifecycle hooks for AI agents.
- **[Adding Project Descriptions](docs/contributing/description.md)**: Learn how to add new domain presets and project meta-information options.

## Pull Request Process

1.  **Fork the repo** and create your branch from `main`.
2.  **Add your JSON files** following the structures detailed in the guides above.
3.  **Validate your JSON**: Our repository uses automated pre-commit hooks (Husky & lint-staged) that format your JSON files using Prettier. Just make sure your JSON is valid syntax.
4.  **Open a Pull Request**: Provide a clear description of what you are adding. All PRs go through a Code Review process to ensure the prompts are high quality and don't conflict with existing rules.

## Code formatting & Validation

We use **Prettier** to enforce a consistent code style across the entire project (including Markdown and JSON files).
When you make a commit, our pre-commit hook will automatically format your files (4 spaces for indentation, single quotes for code, and proper line endings). Prettier also automatically adds a trailing newline at the end of every file to comply with Git standards — you don't need to worry about formatting manually, just ensure your JSON syntax is correct!

If you are contributing to the core Angular codebase, the hook will also run `eslint --fix` to ensure our strict architectural rules (like the Zero Literals Policy) are maintained.
