import type { Elysia } from "elysia";
import { ChatController } from "./chat.controller";
import { SendMessageSchema } from "./chat.dto";
import { authMiddleware } from "../auth/auth.middleware";

/**
 * Manages the registration of all chat-related routes.
 */
export class ChatRoutes {
  private app: Elysia;
  private controller: ChatController;

  constructor(app: Elysia) {
    this.app = app;
    this.controller = new ChatController();
    console.log("Registering chat routes");
  }

  public register(): void {
    this.app.group("/chat", (group) =>
      group.guard({ beforeHandle: authMiddleware }, (guarded) =>
        guarded
          // Send a new message
          .post("/message", (ctx) => this.controller.sendMessage(ctx as any), {
            body: SendMessageSchema,
          })

          // Get all messages for a connection
          .get("/:connectionId", (ctx) =>
            this.controller.getMessages(ctx as any),
          ),
      ),
    );
  }
}
