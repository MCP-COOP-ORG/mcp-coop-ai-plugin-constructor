# Adding Platforms & IDEs

The MCP COOP AI Plugin Constructor supports generating context for various AI assistants and IDEs (e.g., Cursor, Claude, Antigravity).
All platform definitions live in `public/assets/platforms/`.

## How to add a new Platform

To add a new platform, create a new JSON file in `public/assets/platforms/` named after the platform (e.g., `github-copilot.json`).

### JSON Structure

```json
{
    "id": "github-copilot",
    "name": "GitHub Copilot",
    "description": "Configuration for GitHub Copilot Workspace.",
    "extension": ".copilotrules",
    "defaults": {
        "trigger": "Run this when prompted.",
        "globs": "*",
        "skillDescription": "Follow these technical rules.",
        "ruleDescription": "Follow these architectural rules.",
        "workflowDescription": "Use this workflow."
    },
    "template": "..."
}
```

### Attributes Explained

- **`id`**: A unique string identifier. Must match the filename without the extension.
- **`name`**: The human-readable name displayed in the UI.
- **`description`**: A short description of the platform.
- **`extension`**: The exact file extension generated for this platform (e.g., `.cursorrules`, `.agent`).
- **`defaults`**: Fallback strings used when a specific snippet doesn't provide a description for this platform.
- **`template`**: The base markdown template. Use `{{ dynamicCategory }}` and `{{ dynamicItem }}` tokens so the Builder knows where to inject the selected rules.
