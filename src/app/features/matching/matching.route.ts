import type { Elysia } from "elysia";
import { MatchingController } from "./matching.controller";
import { authMiddleware } from "../auth/auth.middleware";

/**
 * Manages the registration of all matching-related routes.
 */
export class MatchingRoutes {
  private app: Elysia;
  private controller: MatchingController;

  constructor(app: Elysia) {
    this.app = app;
    this.controller = new MatchingController();
    console.log("Registering matching routes");
  }

  public register(): void {
    this.app.group("/matching", (group) =>
      group
        // All matching routes MUST be protected.
        .use(authMiddleware)

        // The main endpoint to get the user's daily batch
        .get("/batch", (context) =>
          this.controller.getDailyBatch(context as any),
        ),
    );
  }
}
