---
name: Planning
description: Standard operational workflow for planning.
---

## Deep Planning Workflow

Execute this workflow whenever a task requires architectural changes, touches multiple files, or involves high ambiguity.

### Phase 1: Discovery (No Code Changes)

1. Read the user's request carefully.
2. Use `grep_search`, `list_dir`, and `view_file` to map the current state of the codebase.
3. Check `docs/context.md` or `docs/architecture.md` for existing patterns.
4. **Checkpoint**: If you lack context, stop and ask the user clarifying questions. Do NOT guess.

### Phase 2: Plan Construction

1. Create or update `implementation_plan.md`.
2. Document the goal, required changes, and specifically map out files to be modified, created, or deleted.
3. Highlight any risks or breaking changes using `> [!WARNING]` alerts.

### Phase 3: User Approval

1. Stop execution.
2. Explicitly ask the user to review `implementation_plan.md`.
3. **NEVER** proceed to writing code until the user says "Approved" or "Go ahead".
