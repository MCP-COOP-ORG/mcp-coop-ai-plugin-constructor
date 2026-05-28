# Schemas Barrel

## Business Context

This directory contains the structural blueprints for generating context archives for different AI assistants. It dictates exactly what files and directories the AI Plugin Constructor should output.

## Technical Functionality

Exports array-based configuration schemas (`ArchivePattern[]`). The Archive Generator service iterates over these schemas to determine archive composition.

### Exported Entities

#### `antigravity.ts`

- **Business**: The blueprint for generating files specific to the Antigravity (Gemini) AI agent.
- **Technical**: Exports an array of patterns mapping to `.gemini/antigravity` directories.

#### `cursor.ts`

- **Business**: The blueprint for generating files specific to the Cursor IDE's AI.
- **Technical**: Exports an array of patterns mapping to `.cursor/rules` directories.

#### `claude.ts`

- **Business**: The blueprint for generating files specific to the Claude Desktop application.
- **Technical**: Exports an array of patterns mapping to Claude's memory structures.
