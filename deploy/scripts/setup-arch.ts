import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

console.log("🧱 Setting up modular Bun architecture...");

const dirs = [
  "src/app/middlewares",
  "src/app/config",
  "src/modules/user",
  "src/modules/post",
  "src/core/db",
  "src/core/errors",
  "src/core/utils",
];

const files: Record<string, string> = {
  "src/app/server.ts": `
import { Elysia } from "elysia";
import { registerUserRoutes } from "../modules/user/user.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = new Elysia()
  .use(errorHandler)
  .get("/", () => "Server running ✅");

registerUserRoutes(app);
app.listen(process.env.PORT || 3000);
`,

  "src/app/middlewares/errorHandler.ts": `
export const errorHandler = (app: any) => {
  app.onError(({ code, error }) => {
    console.error("[Error]", code, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  });
  return app;
};
`,

  "src/app/config/env.ts": `
export const env = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db"
};
`,

  "src/modules/user/user.routes.ts": `
import { Elysia } from "elysia";
import { getUserController } from "./user.controller";

export const registerUserRoutes = (app: Elysia) => {
  const controller = getUserController();
  app.get("/users", controller.list);
  app.post("/users", controller.create);
  return app;
};
`,

  "src/modules/user/user.controller.ts": `
import { userService } from "./user.service";
export const getUserController = () => ({
  list: async () => userService.list(),
  create: async ({ body }: any) => userService.create(body),
});
`,

  "src/modules/user/user.service.ts": `
import { userRepo } from "./user.repository";
export const userService = {
  list: () => userRepo.findAll(),
  create: (data: any) => userRepo.insert(data),
};
`,

  "src/modules/user/user.repository.ts": `
export const userRepo = {
  findAll: () => [{ id: 1, name: "Example User" }],
  insert: (data: any) => ({ id: Date.now(), ...data }),
};
`,

  "src/core/db/sequelize.ts": `
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DATABASE_URL || "", {
  dialect: "postgres",
  logging: false,
});
`,
};

// --- Create folders if missing ---
dirs.forEach((d) => mkdirSync(d, { recursive: true }));

// --- Write new files only if they don't already exist ---
for (const [path, content] of Object.entries(files)) {
  const full = join(process.cwd(), path);
  if (!existsSync(full)) {
    writeFileSync(full, content.trimStart());
    console.log("📄 Created:", path);
  } else {
    console.log("⚠️ Skipped (already exists):", path);
  }
}

// --- Update package.json dependencies ---
const pkgPath = join(process.cwd(), "package.json");
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(await Bun.file(pkgPath).text());
  pkg.dependencies ||= {};
  pkg.dependencies["elysia"] = pkg.dependencies["elysia"] || "latest";
  pkg.dependencies["sequelize"] = pkg.dependencies["sequelize"] || "latest";
  pkg.dependencies["pg"] = pkg.dependencies["pg"] || "latest";
  pkg.dependencies["zod"] = pkg.dependencies["zod"] || "latest";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("📦 Updated dependencies in package.json");
}

// --- Create .env if missing ---
const envPath = join(process.cwd(), ".env");
if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    `DATABASE_URL=postgres://user:password@localhost:5432/appdb\nPORT=3000\n`,
  );
  console.log("🌱 Created .env");
}

console.log("✅ Modular architecture setup complete!");
console.log("➡ Next: bun install && bun run src/app/server.ts");
