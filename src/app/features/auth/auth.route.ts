import type { Elysia } from "elysia";
import { t } from "elysia";
import { AuthController } from "./auth.controller";

/**
 * Manages the registration of all authentication-related routes.
 */
export class AuthRoutes {
  private app: Elysia;
  private controller: AuthController;

  // We define the validation schemas as private members for encapsulation
  private schemas = {
    register: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
    login: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  };

  /**
   * Initializes the AuthRouter with the main Elysia app.
   * @param app The main Elysia app instance.
   */
  constructor(app: Elysia) {
    this.app = app;
    this.controller = new AuthController();
    console.log("Registering auth routes");
  }

  /**
   * Registers the /auth route group and its endpoints.
   */
  public register(): void {
    this.app.group("auth", (group) =>
      group
        .post("register", this.controller.register.bind(this.controller), {
          body: this.schemas.register,
        })
        .post("login", this.controller.login.bind(this.controller), {
          body: this.schemas.login,
        })
        .post(
          "validateToken",
          this.controller.validateToken.bind(this.controller),
          {
            body: t.Object({
              token: t.String(),
            }),
          },
        )
        .post(
          "passwordReset",
          this.controller.passwordReset.bind(this.controller),
          {
            body: t.Object({
              email: t.String({ format: "email" }),
            }),
          },
        )
        .get("test", () => "Auth route works!"),
    );
  }
}
