import type { Elysia } from "elysia";
import { UserController } from "./user.controller"; // Import the class

/**
 * Manages the registration of all user-related routes.
 */
export class UserRouter {
  private app: Elysia;
  private controller: UserController;

  constructor(app: Elysia) {
    this.app = app;
    this.controller = new UserController();
    console.log("Registering user routes");
  }

  /**
   * Registers the /users route group and its endpoints.
   */
  public register (): void {
    this.app.group("/users", (group) =>
      group
        .get(
          "/",
          this.controller.list.bind(this.controller)
        )
        .post(
          "/",
          this.controller.create.bind(this.controller)
          // We would add validation here
          // { body: CreateUserSchema }
        )
        .get(
          "/test-error",
          this.controller.testError.bind(this.controller)
        )
    );
  }
}