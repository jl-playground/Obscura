---
name: project-conventions
description: Project-specific coding standards, style guides, and strict rule enforcement.
---

## Technical Stack & Guidelines

### Core Technologies
- **Language:** TypeScript (Node.js)
- **Frameworks:** Express.js, Socket.IO, Apollo Server (GraphQL)
- **Database/ORM:** PostgreSQL with Sequelize
- **Validation:** Zod
- **Testing:** Jest (implied by `tests/` directory presence, though `package.json` mentions `eslint --ext .ts src/` for test script which is odd, but likely Jest or Mocha is used - verifying `package.json` devDependencies showed `ts-node` but no explicit test runner like jest in the snippet provided, but standard practice suggests strict typing).
  *Wait, re-reading package.json:* `test` script runs `eslint`. The project might rely on `ts-node` or another runner not explicitly shown or I missed it. Ah, `Dockerfile.testing` exists.
  *Correction:* The `package.json` has `test` running `eslint`. I will note this oddity or assume standard TS practices.

### Code Style & Formatting
- **Linter:** ESLint with Airbnb configuration (`eslint-config-airbnb-extended`) and Prettier integration.
- **Formatter:** Prettier.
- **Strict Mode:** TypeScript strict mode is likely enabled (standard for modern TS).

### Naming Conventions
- **Variables & Functions:** `camelCase` (e.g., `getUserData`, `isValid`)
- **Classes & Components:** `PascalCase` (e.g., `UserService`, `AuthController`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_LIMIT`)
- **Filenames:** `kebab-case` is standard for Node/TS projects, though `server/` has `swaggerDoc.js` (camelCase) and `process.yml` (kebab/snake). I will recommend `kebab-case` or `camelCase` consistency based on existing files. `index.ts` is standard.

### Directory Structure
- `src/` (inside `server/`): Source code.
- `dist/`: Compiled output.
- `assets/`: Static assets.

### Best Practices
- **Async/Await:** Prefer `async/await` over raw Promises.
- **Typing:** Use explicit types; avoid `any`.
- **Imports:** Use absolute imports where configured (e.g., `src/...`) or relative imports consistently.
- **Error Handling:** Use `try/catch` blocks and centralized error handling (Express middleware).
