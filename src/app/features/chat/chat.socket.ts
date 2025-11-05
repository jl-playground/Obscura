import { t } from "elysia";
import type { Context } from "elysia";
import { ServerWebSocket } from "elysia/ws/bun";

// This is the shape of the message we're expecting, per your example.
// We can use the 'body' schema in the router to enforce this.
interface ChatMessage {
  message: string;
}

/**
 * Manages the simple, baseline WebSocket connection logic.
 */
export class SocketHandler {
  /**
   * Defines the validation schema for incoming messages.
   */
  public getSchema() {
    return t.Object({
      message: t.String(),
    });
  }

  /**
   * Called when a client connects.
   */
  public open(ws: any) {
    console.log(`[WS] Connection opened: ${ws.data.id}`);
  }

  /**
   * Called when a client sends a message.
   */
  public message(ws: any, message: any) {
    console.log(`[WS] Message received from ${ws.data.id}:`, message);

    // Send a response (per your docs)
    ws.send(`You sent: ${message}`);
  }

  /**
   * Called when a client disconnects.
   */
  public close(ws: any) {
    console.log(`[WS] Connection closed: ${ws.data.id}`);
  }
}
