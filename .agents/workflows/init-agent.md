---
name: Init-agent
description: Standard operational workflow for init-agent.
---

## Agent Session Initialization Workflow

Execute this workflow **implicity** at the start of every new conversation or major context switch.

### Phase 1: Pre-Flight Check

1. Read the system prompt and `GEMINI.md` carefully to internalize the project's strict prohibitions (e.g., no `any`, no `eslint-disable`).
2. If MCP tools are available (e.g., `mcp_taiga-ui_get_overview`), execute them to load framework-specific context into your memory.
3. Read `docs/context.md` to understand the most recent commits and current architectural state.

### Phase 2: Environment Validation

1. Verify the current working directory.
2. Run `git status` to check the current branch and ensure there are no conflicting uncommitted changes that might interfere with your work.
3. **Checkpoint**: If the tree is dirty and it wasn't expected, warn the user.

### Phase 3: Acknowledgment

1. Greet the user concisely.
2. State the current branch and confirm that the project directives have been loaded.
3. Ask for the first task.
