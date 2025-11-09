import type { Elysia } from "elysia";
import { ConnectionController } from "./connection.controller";
import { CreateConnectionSchema, RevealVoteSchema } from "./connection.dto";
import { authMiddleware } from "../auth/auth.middleware";

export class ConnectionRoutes {
  private app: Elysia;
  private controller: ConnectionController;

  constructor(app: Elysia) {
    this.app = app;
    this.controller = new ConnectionController();
    console.log("Registering connection routes");
  }

  public register(): void {
    this.app.group("/connections", (group) =>
      group.guard({ beforeHandle: authMiddleware }, (guarded) =>
        guarded
          // Create a new connection
          .post("/", (ctx) => this.controller.createConnection(ctx as any), {
            body: CreateConnectionSchema,
          })

          // Reveal vote for a specific connection
          .patch(
            "/:id/reveal",
            (ctx) => this.controller.handleRevealVote(ctx as any),
            { body: RevealVoteSchema },
          ),
      ),
    );
  }
}
