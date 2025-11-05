import { dataSource } from "@/core/db/dataSource";
import { Message } from "../../../core/db/entities/message.entity";

export const MessageRepository = dataSource.getRepository(Message).extend({
  /**
   * Finds all messages for a specific connection, ordered by creation time.
   * @param connectionId - The UUID of the connection.
   * @returns An array of Message entities.
   */
  findMessagesByConnection (connectionId: string) {
    return this.find({
      where: { connection_id: connectionId },
      order: { created_at: "ASC" }, // Show oldest messages first
      relations: ["sender"], // Optionally attach sender info
    });
  },
});
