import type { Elysia } from "elysia";
import { registerUserRoutes } from "@/app/modules/user/user.routes";

export const registerRoutes = (app: Elysia) => {
  registerUserRoutes(app);
  return app;
};
