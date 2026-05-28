# Models Barrel

## Business Context

This directory defines the core data contracts and domain entities used throughout the MCP COOP AI Plugin Constructor. It ensures that the shape of the data remains consistent as it flows through the various configuration steps.

## Technical Functionality

Exports TypeScript `interfaces` and `types`. These definitions provide strict type safety for forms, state signals, and JSON configurations.

### Exported Entities

#### `archive.ts`

- **Business**: Defines what a generated file inside the final ZIP archive should look like.
- **Technical**: Exports interfaces like `GeneratedFile` and `ArchivePattern` used by the Archive Generator service.

#### `pages-config.ts`

- **Business**: Outlines the structure of the UI configurations generated from the file system.
- **Technical**: Exports types representing the JSON metadata for rendering dynamic form categories and fields.

#### `platform-config.ts`

- **Business**: Defines the specific wrappers and templates required by target AI platforms (e.g., Cursor, Claude).
- **Technical**: Exports interfaces for the JSON structure fetched from `public/assets/platforms/`.
