import { ChatService } from "./chat.service";
import { GetMessagesContext, SendMessageContext } from "./chat.types";

// --- Context Types ---

export class ChatController {
  private service = new ChatService();

  /**
   * Handles POST /chat/message
   * Sends a new message.
   */
  public async sendMessage(context: SendMessageContext) {
    const { auth, body, set } = context;
    try {
      const result = await this.service.sendMessage(auth, body);
      set.status = 201; // Created
      return { status: "success", data: result };
    } catch (error: any) {
      if (error.message.includes("not found")) {
        set.status = 404;
      } else if (error.message.includes("not a part")) {
        set.status = 403;
      } else {
        set.status = 500;
      }
      return { status: "error", message: error.message };
    }
  }

  /**
   * Handles GET /chat/:connectionId
   * Gets all messages for a connection.
   */
  public async getMessages(context: GetMessagesContext) {
    const { auth, params, set } = context;
    try {
      const result = await this.service.getMessages(auth, params.connectionId);
      set.status = 200; // OK
      return { status: "success", data: result };
    } catch (error: any) {
      if (error.message.includes("not found")) {
        set.status = 404;
      } else if (error.message.includes("not a part")) {
        set.status = 403;
      } else {
        set.status = 500;
      }
      return { status: "error", message: error.message };
    }
  }
}
