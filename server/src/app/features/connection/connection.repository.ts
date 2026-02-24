import { Op } from 'sequelize';

import Database from '@/app/core/database/database';

import type Connection from '@/app/core/database/entities/connection.entity';
import type { CreationAttributes } from 'sequelize';

export default class ConnectionRepository {
  private models = Database.getInstance().models;

  async findAll(): Promise<Connection[]> {
    return this.models.Connection.findAll();
  }

  async findByPk(id: string): Promise<Connection | null> {
    return this.models.Connection.findByPk(id, {
      include: [
        {
          model: this.models.User,
          as: 'userA',
          attributes: ['id', 'email', 'first_name', 'last_name', 'created_at'],
        },
        {
          model: this.models.User,
          as: 'userB',
          attributes: ['id', 'email', 'first_name', 'last_name', 'created_at'],
        },
      ],
    });
  }

  async findUserConnections(userId: string): Promise<Connection[]> {
    return this.models.Connection.findAll({
      where: {
        [Op.or]: [{ user_a_id: userId }, { user_b_id: userId }],
      },
      include: [
        {
          model: this.models.User,
          as: 'userA',
          attributes: ['id', 'email', 'first_name', 'last_name', 'created_at'],
        },
        {
          model: this.models.User,
          as: 'userB',
          attributes: ['id', 'email', 'first_name', 'last_name', 'created_at'],
        },
      ],
    });
  }

  async findExistingConnection(userAId: string, userBId: string): Promise<Connection | null> {
    return this.models.Connection.findOne({
      where: {
        [Op.or]: [
          {
            user_a_id: userAId,
            user_b_id: userBId,
          },
          {
            user_a_id: userBId,
            user_b_id: userAId,
          },
        ],
      },
    });
  }

  async create(data: CreationAttributes<Connection>): Promise<Connection> {
    return this.models.Connection.create(data);
  }

  async update(id: string, data: Partial<CreationAttributes<Connection>>): Promise<[number, Connection[]]> {
    return this.models.Connection.update(data, {
      where: { id },
      returning: true,
    });
  }

  async delete(id: string): Promise<number> {
    return this.models.Connection.destroy({
      where: { id },
    });
  }

  async restore(id: string): Promise<number> {
    await this.models.Connection.restore({
      where: { id },
    });
    return this.models.Connection.count({
      where: { id },
    });
  }

  async incrementMessageCount(id: string): Promise<void> {
    await this.models.Connection.increment('message_count', {
      where: { id },
    });
  }
}
