# Pages Barrel

## Business Context

This directory defines the top-level routable views of the application, such as the initial Welcome screen and the main Builder shell. They orchestrate the overall layout and navigation flow.

## Technical Functionality

Exports standalone "Smart" Angular components that are bound directly to the Angular Router.

### Exported Entities

#### `welcome.ts`

- **Business**: The landing page of the application, introducing the user to the MCP COOP AI Plugin Constructor.
- **Technical**: A stateless, routable view containing hero imagery and a "Get Started" link to the Builder.

#### `builder.ts`

- **Business**: The core shell surrounding the workflow steps, providing persistent navigation and a progress indicator.
- **Technical**: A routable component holding the `<router-outlet>`. It uses `computed()` to sync the Taiga UI Stepper with the current browser URL.
