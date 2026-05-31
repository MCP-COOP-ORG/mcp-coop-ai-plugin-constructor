---
name: Orchestrator
description: Standard operational workflow for orchestrator.
---

## Multi-Step Orchestration Workflow

Use this workflow to manage the execution of a long, multi-file implementation plan.

### Phase 1: Initialization

1. Create or update the `task.md` artifact.
2. Break down the approved implementation plan into a checklist of atomic, verifiable tasks.

### Phase 2: Iterative Execution

1. Pick the first uncompleted task. Mark it as `[/]` (in progress).
2. Execute the code changes for that specific task ONLY.
3. Run local verification (e.g., `npm run lint`, `npm run typecheck`, or specific tests).
4. **Checkpoint**: If verification fails, fix the errors immediately. Do not move to the next task.
5. Mark the task as `[x]` (completed).

### Phase 3: Synchronization

1. Summarize what was done in the current step to the user.
2. Ask if you should proceed to the next checklist item.
3. Repeat Phase 2 until the checklist is fully complete.
