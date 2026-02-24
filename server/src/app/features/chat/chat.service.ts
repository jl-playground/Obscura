import { v4 as uuidv4 } from 'uuid';
import MessageRepository from './message.repository';
import RoomRepository from './room.repository';
import ConnectionRepository from '../connection/connection.repository';
import Message from '@/app/core/database/entities/message.entity';
import Room from '@/app/core/database/entities/room.entity';
import Database from '@/app/core/database/database';

export default class ChatService {
  private messageRepository = new MessageRepository();
  private roomRepository = new RoomRepository();
  private connectionRepository = new ConnectionRepository();

  /**
   * Send a message in a room
   * - Creates message
   * - Increments connection message count
   * - Transitions to REVEALED when 50 messages reached
   */
  async sendMessage(userId: string, connectionId: string, content: string): Promise<Message> {
    const sequelize = Database.getInstance().sequelize;

    // Use transaction for atomic operations
    const transaction = await sequelize.transaction();

    try {
      // Verify user is part of connection
      const connection = await this.connectionRepository.findByPk(connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
        throw new Error('User is not part of this connection');
      }

      // Get or create room
      const room = await this.roomRepository.findOrCreateByConnectionId(connectionId);

      // Create message
      await this.messageRepository.create({
        id: uuidv4(),
        room_id: room.id,
        sender_id: userId,
        content,
      });

      // Increment message count
      const newMessageCount = (connection.message_count || 0) + 1;
      await this.connectionRepository.update(connectionId, {
        message_count: newMessageCount,
        // Transition to REVEALED at 50 messages
        status: newMessageCount >= 50 ? 'REVEALED' : connection.status,
      });

      await transaction.commit();

      // Reload message with sender details
      return this.messageRepository.findByRoomId(room.id, 1, 0).then((result) => result.rows[0]);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get paginated messages for a connection
   * Returns newest messages first, limit 50 per page
   */
  async getMessages(
    userId: string,
    connectionId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{
    messages: Message[];
    total: number;
    hasMore: boolean;
  }> {
    // Verify user is part of connection
    const connection = await this.connectionRepository.findByPk(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      throw new Error('User is not part of this connection');
    }

    // Get room
    const room = await this.roomRepository.findByConnectionId(connectionId);
    if (!room) {
      return { messages: [], total: 0, hasMore: false };
    }

    const { rows, count } = await this.messageRepository.findByRoomId(
      room.id,
      Math.min(limit, 100), // Max 100 per request
      offset,
    );

    return {
      messages: rows,
      total: count,
      hasMore: offset + rows.length < count,
    };
  }

  /**
   * Get all rooms for a user with last message info
   */
  async getRoomList(userId: string): Promise<any[]> {
    const rooms = await this.roomRepository.findByUserId(userId);

    // Fetch last message for each room
    const roomsWithMessages = await Promise.all(
      rooms.map(async (room) => {
        const { rows: lastMessages } = await this.messageRepository.findByRoomId(room.id, 1, 0);

        return {
          id: room.id,
          connection_id: room.connection_id,
          connection: room.connection,
          last_message: lastMessages[0] || null,
          created_at: room.created_at,
        };
      }),
    );

    return roomsWithMessages;
  }

  /**
   * Get single room details for a connection
   */
  async getRoom(userId: string, connectionId: string): Promise<Room | null> {
    // Verify user is part of connection
    const connection = await this.connectionRepository.findByPk(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      throw new Error('User is not part of this connection');
    }

    return this.roomRepository.findByConnectionId(connectionId);
  }
}
