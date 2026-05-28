# Source Directory Navigation

Welcome to the `src` directory of the MCP COOP AI Plugin Constructor. This document serves as the master index to help AI assistants and developers navigate the flat, role-based architecture of the application.

## 📂 Architecture Overview

The application follows a strict technical role grouping within the `app/` directory. Below are links to the dedicated documentation for each module. Click on any link to view detailed business and technical context for every entity exported within that domain.

### 🌐 Core Application Layers

- **[Pages](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/pages/README.md)**: Top-level routable "Smart" components (Welcome, Builder shell).
- **[Feature Components](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/components/README.md)**: The core steps of the Builder workflow (Setup, Stack, Review).
- **[Services](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/services/README.md)**: Core business logic, global state management, and ZIP generation.

### 🛠️ Shared Library (`app/shared/`)

- **[Shared Components](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/shared/components/README.md)**: Reusable UI elements, form controls, and layout wrappers.
- **[Constants](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/shared/constants/README.md)**: The Single Source of Truth for Zero Literals (dictionaries, static arrays).
- **[Models](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/shared/models/README.md)**: TypeScript interfaces ensuring strict type safety across the app.
- **[Schemas](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/shared/schemas/README.md)**: Blueprints dictating the exact directory output for different AI agents.
- **[Configs](file:///Users/vitali_shpakowski/MCP-COOP-DAO/mcp-coop-ai-plugin-constructor/src/app/shared/configs/README.md)**: Auto-generated UI mappings from the `public/assets/` file system.

> [!NOTE]  
> All subdirectories utilize **Barrel Files (`index.ts`)**. Imports between domains must strictly route through these barrels using the `@shared/*` or `@services` path aliases defined in `tsconfig.json`.
