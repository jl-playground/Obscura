import type { Elysia } from "elysia";
import { authMiddleware } from "../auth/auth.middleware";
import { RoomController } from "./room.controller";

/**
 * Manages the registration of all user-related routes.
 */
export class RoomRoutes {
  private app: Elysia;
  private controller: RoomController;

  constructor(app: Elysia) {
    this.app = app;
    this.controller = new RoomController();
    console.log("Registering room routes");
  }

  /**
   * Registers the /users route group and its endpoints.
   */
  public register(): void {
    this.app.group("/rooms", (group) =>
      group
        // Protected sub-routes
        .guard({ beforeHandle: authMiddleware }, (guarded) =>
          guarded.get("/", (ctx) => this.controller.list(ctx as any)),
        )

        // Public routes
        .get("/test", () => "Profile route works!"),
    );
  }
}
