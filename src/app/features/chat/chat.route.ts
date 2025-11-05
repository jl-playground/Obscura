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
      group
        .use(authMiddleware) // All chat routes are protected

        // Send a new message
        .post(
          "/message",
          (context) => this.controller.sendMessage(context as any),
          {
            body: SendMessageSchema,
          },
        )

        // Get all messages for a connection
        .get("/:connectionId", (context) =>
          this.controller.getMessages(context as any),
        ),
    );
  }
}
