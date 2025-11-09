import { dataSource } from "@/core/db/dataSource";
import { ConnectionRepository } from "@/app/features/connection/connection.repository";
import { MessageRepository } from "./message.repository";
import {
  Connection,
  ConnectionStatus,
} from "@/core/db/entities/connection.entity";
import { Message } from "../../../core/db/entities/message.entity";
import type { SendMessageDto } from "./chat.dto";
import type { AuthPayload } from "@/app/features/auth/auth.dto";

// This is our non-negotiable threshold
const REVEAL_THRESHOLD = 50;

export class ChatService {
  private connRepo = ConnectionRepository;
  private msgRepo = MessageRepository;

  /**
   * Fetches all messages for a given connection.
   */
  public async getMessages (auth: AuthPayload, connectionId: string) {
    const { userId } = auth;

    // 1. Find the connection
    const connection = await this.connRepo.findOneBy({ id: connectionId });
    if (!connection) {
      throw new Error("Connection not found.");
    }

    // 2. Verify user is part of it
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      throw new Error("You are not a part of this connection.");
    }

    // 3. Fetch messages
    return this.msgRepo.findMessagesByConnection(connectionId);
  }

  /**
   * Sends a new message and updates the connection's message_count.
   * This is the core logic that triggers the 'REVEAL_READY' status.
   */
  public async sendMessage (auth: AuthPayload, dto: SendMessageDto) {
    const { userId } = auth;
    const { connectionId, messageType, content } = dto;

    // This is a transaction. Both the message save and the
    // connection update must succeed, or both will fail.
    return dataSource.transaction(async (transactionalEntityManager) => {
      const connRepo = transactionalEntityManager.withRepository(this.connRepo);
      const msgRepo = transactionalEntityManager.withRepository(this.msgRepo);

      // 1. Find the connection
      const connection = await connRepo.findOneBy({ id: connectionId });
      if (!connection) {
        throw new Error("Connection not found.");
      }

      // 2. Verify user is part of this connection
      if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
        throw new Error("You are not a part of this connection.");
      }

      // 3. Create and save the new message
      const newMessage = msgRepo.create({
        connection_id: connectionId,
        sender_id: userId,
        message_type: messageType,
        content_url: content, // The text or URL
      });
      const savedMessage = await msgRepo.save(newMessage);

      // 4. Update the connection's status and message count
      // We only update the count if the reveal hasn't happened yet.
      if (
        connection.status === ConnectionStatus.PENDING ||
        connection.status === ConnectionStatus.ACTIVE
      ) {
        connection.status = ConnectionStatus.ACTIVE; // Chat is now active
        connection.message_count += 1;

        // 5. CHECK THE THRESHOLD
        if (connection.message_count >= REVEAL_THRESHOLD) {
          connection.status = ConnectionStatus.REVEAL_READY;
          console.log(
            `[REVEAL READY] Connection ${connection.id} has hit the threshold!`,
          );
        }

        await connRepo.save(connection);
      }

      return savedMessage;
    });
  }
}
