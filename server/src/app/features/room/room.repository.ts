import { Op } from 'sequelize';
import Database from '@/app/core/database/database';

import type Room from '@/app/core/database/entities/room.entity';

export default class RoomRepository {
  private models = Database.getInstance().models;

  async findById(id: string): Promise<Room | null> {
    return this.models.Room.findByPk(id);
  }

  async create(data: Partial<Room>): Promise<Room> {
    return this.models.Room.create(data);
  }

  async update(id: string, data: Partial<Room>): Promise<Room | null> {
    const room = await this.models.Room.findByPk(id);
    if (!room) return null;
    return room.update(data);
  }

  async delete(id: string): Promise<number> {
    return this.models.Room.destroy({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Room[]> {
    return this.models.Room.findAll({
      include: [
        {
          model: this.models.Connection,
          as: 'connection',
          required: true,
          where: {
            [Op.or]: [{ user_a_id: userId }, { user_b_id: userId }],
          },
          include: [
            {
              model: this.models.User,
              as: 'userA',
              attributes: ['id', 'email'],
              include: [
                {
                  model: this.models.Profile,
                  as: 'profile',
                  attributes: ['id'],
                  include: [
                    {
                      model: this.models.User,
                      as: 'user',
                      attributes: ['id', 'email'],
                    },
                  ],
                },
              ],
            },
            {
              model: this.models.User,
              as: 'userB',
              attributes: ['id', 'email'],
              include: [
                {
                  model: this.models.Profile,
                  as: 'profile',
                  attributes: ['id'],
                  include: [
                    {
                      model: this.models.User,
                      as: 'user',
                      attributes: ['id', 'email'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: this.models.Message,
          as: 'messages',
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findByIdWithMessages(roomId: string, userId: string): Promise<Room | null> {
    return this.models.Room.findOne({
      where: { id: roomId },
      include: [
        {
          model: this.models.Connection,
          as: 'connection',
          required: true,
          where: {
            [Op.or]: [{ user_a_id: userId }, { user_b_id: userId }],
          },
        },
        {
          model: this.models.Message,
          as: 'messages',
          order: [['created_at', 'ASC']],
        },
      ],
    });
  }
}
