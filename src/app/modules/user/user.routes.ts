import type { Elysia } from "elysia";
import { getUserController } from "./user.controller";

export const registerUserRoutes = (app: Elysia) => {
  const controller = getUserController();
  console.log("Registering user routes");

  app.group("/users", (group) =>
    group
      .get("/", controller.list)
      .post("/", controller.create)
      .get("/test-error", () => {
        throw new Error("This is a test error!");
      }),
  );
  return app;
};
