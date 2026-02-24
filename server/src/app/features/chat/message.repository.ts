import Database from '@/app/core/database/database';
import Message from '@/app/core/database/entities/message.entity';
import { CreationAttributes } from 'sequelize';

export default class MessageRepository {
  private models = Database.getInstance().models;

  async findByRoomId(
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ rows: Message[]; count: number }> {
    const { rows, count } = await this.models.Message.findAndCountAll({
      where: { room_id: roomId },
      include: [
        {
          association: 'sender',
          attributes: ['id', 'email'],
        },
      ],
      order: [['created_at', 'DESC']], // Newest first
      limit,
      offset,
    });

    return { rows, count };
  }

  async findByConnectionId(connectionId: string): Promise<Message[]> {
    return this.models.Message.findAll({
      include: [
        {
          association: 'room',
          where: { connection_id: connectionId },
          required: true,
        },
        {
          association: 'sender',
          attributes: ['id', 'email'],
        },
      ],
      order: [['created_at', 'DESC']], // Newest first
    });
  }

  async create(
    input: CreationAttributes<Message>
  ): Promise<Message> {
    return this.models.Message.create(input);
  }

  async delete(messageId: string): Promise<number> {
    return this.models.Message.destroy({
      where: { id: messageId },
    });
  }

  async restore(messageId: string): Promise<number> {
    return this.models.Message.restore({
      where: { id: messageId },
    });
  }
}
