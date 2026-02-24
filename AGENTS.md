# AGENTS Instructions

1. Follow the existing Express + Sequelize + Zod feature structure: every feature lives under `server/src/app/features/<feature>` with a controller, service, repository, route, and validator when applicable.
2. Database entities live in `server/src/app/core/database/entities`. Register new models through `initModel`, `associate`, and let `server/src/app/core/database/entities/index.ts` auto-register them.
3. Use Zod validators for request validation, reuse patterns from user/profile features, and keep responses JSON with `{status, data}` or `{status, message}`.
4. Keep styling, error handling, and logging consistent with existing services. Prefer composition over duplication and document new architecture decisions in `ARCHITECTURE.md`.
