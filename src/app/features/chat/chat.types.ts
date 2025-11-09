import type { SendMessageDto } from "./chat.dto";
import type { AuthPayload } from "@/app/features/auth/auth.dto";
import type { Context } from "elysia";
import { MessageType } from "../../../core/db/entities/message.entity";

export type AuthContext = { auth: AuthPayload; set: Context["set"] };
export type SendMessageContext = AuthContext & { body: SendMessageDto };
export type GetMessagesContext = AuthContext & {
  params: { connectionId: string };
};

/**
 * Defines the shape of a WebSocket message from the client.
 */
export interface WebSocketMessage {
  type: "chat.message";
  payload: {
    messageType: MessageType.TEXT | MessageType.VOICE;
    content: string;
  };
}

/**
 * Defines the shape of the data we attach to each WebSocket connection.
 */
export interface WebSocketData {
  auth: AuthPayload;
  connectionId: string;
}
