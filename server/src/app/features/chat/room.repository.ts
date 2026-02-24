import Database from '@/app/core/database/database';
import Room from '@/app/core/database/entities/room.entity';
import { CreationAttributes, Op } from 'sequelize';

export default class RoomRepository {
  private models = Database.getInstance().models;

  async findOrCreateByConnectionId(connectionId: string): Promise<Room> {
    const [room] = await this.models.Room.findOrCreate({
      where: { connection_id: connectionId },
      defaults: {
        id: require('uuid').v4(),
        connection_id: connectionId,
      },
    });

    return room;
  }

  async findByConnectionId(connectionId: string): Promise<Room | null> {
    return this.models.Room.findOne({
      where: { connection_id: connectionId },
      include: [
        {
          association: 'connection',
          attributes: ['id', 'user_a_id', 'user_b_id', 'status'],
        },
      ],
    });
  }

  async findByUserId(userId: string): Promise<Room[]> {
    return this.models.Room.findAll({
      include: [
        {
          association: 'connection',
          where: {
            [Op.or]: [
              { user_a_id: userId },
              { user_b_id: userId },
            ],
          },
          required: true,
          attributes: ['id', 'user_a_id', 'user_b_id', 'status'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findByPk(roomId: string): Promise<Room | null> {
    return this.models.Room.findByPk(roomId, {
      include: [
        {
          association: 'connection',
          attributes: ['id', 'user_a_id', 'user_b_id', 'status'],
        },
      ],
    });
  }

  async create(input: CreationAttributes<Room>): Promise<Room> {
    return this.models.Room.create(input);
  }

  async delete(roomId: string): Promise<number> {
    return this.models.Room.destroy({
      where: { id: roomId },
    });
  }

  async restore(roomId: string): Promise<number> {
    return this.models.Room.restore({
      where: { id: roomId },
    });
  }
}
