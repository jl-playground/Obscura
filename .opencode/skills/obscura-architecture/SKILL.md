---
name: obscura-architecture
description: A living map of the project structure, modules, and data flow. Read this to navigate. UPDATE THIS when adding files/modules.
---

# Obscura Architecture Map

This file documents the high-level structure of the application.

## High-Level Directory Tree

- `server/src/`
    - `app/`
        - `core/` - Shared and foundational logic.
            - `database/` - Sequelize models, migrations, and entities.
            - `services/` - Cross-cutting services (e.g., logging, email).
            - `utils/` - Shared utilities.
            - `middleware/` - Express middlewares.
        - `features/` - Core business modules (Feature-Sliced).
            - `auth/` - Authentication & Authorization.
            - `user/` - User profile & management.
            - `dashboard/` - Main dashboard views/APIs.
    - `server.ts` - Application entry point.

## Key Modules & Responsibilities

### Core (`server/src/app/core/`)
- **Database:** `server/src/app/core/database/` manages Sequelize models (`entities/`) and connections (`config/`).
- **Services:** Global services that span multiple features.

### Features (`server/src/app/features/`)
Each feature folder follows a standardized layout:
- `<feature>.controller.ts`: Handles incoming HTTP requests and responses.
- `<feature>.service.ts`: Implements business logic.
- `<feature>.repository.ts`: Handles data access layer interactions.
- `<feature>.validator.ts`: Zod schemas for request validation.
- `<feature>.route.ts`: Defines API routes and connects to controllers.

## Data Flow

**Request -> Route -> Middleware -> Controller -> Validator -> Service -> Repository -> Database**

1.  **Request:** Hits the API endpoint defined in `*.route.ts`.
2.  **Middleware:** Express middleware (auth, logging) processes the request.
3.  **Controller:** Extracts params/body, calls validation, and invokes the service.
4.  **Validator:** Zod schema validates the request payload.
5.  **Service:** Executes business rules.
6.  **Repository:** Interacts with the database via Sequelize models.
7.  **Response:** JSON response returned to the client.
