# Feature Components Barrel

## Business Context

This directory contains the primary functional steps of the AI Plugin Constructor workflow (e.g., Setup, Stack, Review). These blocks represent the core user journey.

## Technical Functionality

Exports standalone Angular components that act as the views for each workflow step. They bind dynamic Reactive Forms to the `BuilderState`.

### Exported Entities

#### `description-step.ts`

- **Business**: Step 1. Collects basic project meta-data and AI identity information.
- **Technical**: Extends `BaseFormStep` and binds to the `descriptionData` signal.

#### `agents-step.ts`

- **Business**: Step 2. Allows users to select specific AI agent environments (like Cursor or Claude).
- **Technical**: Extends `BaseFormStep` and binds to the `agentsData` signal.

#### `rules-step.ts`

- **Business**: Step 3. Collects architectural, styling, and coding rules that the AI must follow.
- **Technical**: Extends `BaseFormStep` and binds to the `rulesData` signal.

#### `workflows-step.ts`

- **Business**: Step 4. Gathers step-by-step instructions (skills) for common project workflows.
- **Technical**: Extends `BaseFormStep` and binds to the `workflowsData` signal.

#### `review-step.ts`

- **Business**: The final step. Provides a visual tree and IDE to preview and tweak the generated AI files before downloading.
- **Technical**: A complex component that orchestrates `ArchiveGenerator`, updates an internal `isDirty` state upon manual CodeMirror edits, and triggers the ZIP download.
