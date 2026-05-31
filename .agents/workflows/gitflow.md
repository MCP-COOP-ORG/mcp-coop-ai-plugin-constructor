---
name: Gitflow
description: Standard operational workflow for gitflow.
---

## Gitflow Workflow Process

This project strictly follows the Gitflow branching model. Execute these steps strictly in order.

### Phase 1: Feature Initiation

1. Ensure you are on the `develop` branch and it is up to date (`git pull origin develop`).
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. **Checkpoint**: Do not proceed until you have verified the branch name and current HEAD.

### Phase 2: Active Development

1. Implement the feature. Keep changes focused and atomic.
2. Commit frequently using Conventional Commits.
3. If `develop` advances, rebase your feature branch: `git fetch origin && git rebase origin/develop`.

### Phase 3: Integration (Pull Request)

1. Push your branch: `git push -u origin feature/your-feature-name`.
2. Open a Pull Request against the `develop` branch.
3. **NEVER** merge directly. Wait for CI quality checks (lint, tests) to pass.

### Phase 4: Release & Hotfixes (Admin Only)

- **Release**: Branched from `develop` (`release/vX.Y.Z`). Merged into BOTH `main` and `develop`.
- **Hotfix**: Branched from `main` (`hotfix/bug-name`). Merged into BOTH `main` and `develop`.
