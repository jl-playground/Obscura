---
name: obscura-guidelines
description: CRITICAL framework rules, coding standards, and commands for Obscura (Backend).
---

# Obscura Technical Guidelines

## Project Overview

- **Stack:** Node.js + Express + TypeScript + Sequelize + Zod
- **Architecture Pattern:** Feature-Sliced Modular Monolith
- **Location:** Backend logic resides in `server/`.

## Core Rules

1.  **Structure:** Follow the Feature-Sliced structure: `server/src/app/features/<feature>/`.
    - Each feature MUST contain its own Controller, Service, Repository, Validator, and Route.
    - Example: `user/user.controller.ts`, `user.service.ts`, `user.repository.ts`.
2.  **State Management:** Use Service classes for business logic and Repository classes for data access.
3.  **Database:** Use Sequelize with PostgreSQL.
    - Models are defined in `server/src/app/core/database/entities/`.
    - Migrations are managed via `sequelize-cli`.
4.  **Validation:** Use Zod for request validation in `*.validator.ts` files.
5.  **Dependency Injection:** Instantiate services manually in Controllers or Routes (e.g., `this.service = new UserService()`).

## Commands

- **Build:** `cd server && npm run build`
- **Test:** `cd server && npm run test`
- **Lint:** `cd server && npm run lint`
- **Format:** `cd server && npm run format`
- **Start Dev:** `cd server && npm run serve`
- **DB Migrate:** `cd server && npm run db-migrate`
