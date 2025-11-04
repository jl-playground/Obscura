import { t } from "elysia";
import { MessageType } from "./message.entity"; // Import the enum

export const SendMessageSchema = t.Object({
  connectionId: t.String({ format: "uuid" }),
  messageType: t.Enum(MessageType), // "text" or "voice"
  content: t.String({ minLength: 1 }), // The text, or a URL to the voice file
});
export type SendMessageDto = typeof SendMessageSchema.static;
