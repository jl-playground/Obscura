import type { Elysia } from "elysia";
import { MatchingController } from "./matching.controller";
import { authMiddleware } from "../auth/auth.middleware";

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
        .guard({
          beforeHandle: authMiddleware, // <-- don't wrap in async or call it manually
        })
        .get("/batch", (ctx) => this.controller.getDailyBatch(ctx as any)),
    );
  }
}
