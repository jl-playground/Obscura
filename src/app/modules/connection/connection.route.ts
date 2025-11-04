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
      group
        .use(authMiddleware) // All routes are protected

        .post(
          "/",
          (context) => this.controller.createConnection(context as any),
          {
            body: CreateConnectionSchema,
          },
        )

        .patch(
          "/:id/reveal",
          (context) => this.controller.handleRevealVote(context as any),
          { body: RevealVoteSchema },
        ),
    );
  }
}
