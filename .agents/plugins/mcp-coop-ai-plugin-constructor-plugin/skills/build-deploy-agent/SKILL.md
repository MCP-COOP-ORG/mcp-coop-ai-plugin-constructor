---
name: Build-deploy
description: Standard engineering skills and patterns for build-deploy.
---

# Build-deploy

## Docker Development Standards

### Image Construction

- Use multi-stage builds to separate build dependencies from runtime image.
- Pin base image versions explicitly (`node:22-alpine`, not `node:latest`).
- **NEVER** run containers as root — always specify `USER` directive.
- Use `npm ci` instead of `npm install` for deterministic installs.

### Build Context

- Use `.dockerignore` to exclude `node_modules`, `.git`, and build artifacts.
- Prefer `COPY` over `ADD` unless extracting archives.
- Order `Dockerfile` instructions by change frequency — static layers first.
- Combine related `RUN` commands with `&&` to minimize layer count.

> [!WARNING]
> Never store secrets in environment variables at build time — use runtime injection or secret mounts.

## GitHub Actions CI/CD Standards

- Structure workflows as sequential jobs with explicit `needs` dependencies: `quality-checks` → `build` → `deploy`.
- Use `actions/checkout@v4` and `actions/setup-node@v4` — **NEVER** use unversioned action references.
- Use `npm ci` for dependency installation — **NEVER** use `npm install` in CI.
- Cache `node_modules` or use lock-file-based caching to minimize install times.
- Run all quality gates (lint, typecheck, test) in a dedicated job **before** the build job.
- Use Workload Identity Federation for cloud authentication — **NEVER** use long-lived JSON key files.
- Tag Docker images with both `latest` and `${{ github.sha }}` for traceability.
- Use `workflow_dispatch` trigger for manual deployments alongside push-based automation.
- Use path filters to avoid unnecessary builds when only documentation changes.

## Nginx Configuration Standards

- Configure `try_files $uri $uri/ /index.html` for SPA routing — all non-file requests must fall back to the app entry point.
- Enable gzip compression for text-based assets (`text/html`, `application/javascript`, `text/css`, `application/json`).
- Set `Cache-Control: public, max-age=31536000, immutable` for hashed static assets (JS, CSS bundles).
- Set `Cache-Control: no-cache` for `index.html` and service worker files to ensure users always get the latest version.
- **NEVER** expose server version or internal headers — add `server_tokens off`.
- Use `location` blocks with precise matching for static assets and API proxying.
- Configure `gzip_min_length` to avoid compressing tiny responses where overhead exceeds benefit.

## Vitest Configuration

- Define explicit coverage thresholds in `vitest.config.ts` (Lines, Branches, Functions, Statements) and fail the build if they are not met.
- Group tests using `describe` blocks logically, and use `beforeEach`/`afterEach` for setup and teardown to ensure test isolation.
- Run tests in watch mode (`vitest --watch`) during active development for immediate feedback.
- Use Vitest's UI (`vitest --ui`) for easier debugging and visualization of coverage reports.
- Configure path aliases in Vitest to match TypeScript configuration (`tsconfig.json`).

## TESTS ARE FIRST-CLASS CITIZENS

- Never treat tests as an afterthought or ignore failing specs during a refactor.
- If you change dynamic logic, you must immediately update the `.spec.ts` files to validate that specific dynamic behavior (e.g., testing that the form dynamically generates the exact number of controls as the config array).
- Falling below the 85% global coverage threshold (Lines/Functions/Statements/Branches) is a strict architecture violation.
