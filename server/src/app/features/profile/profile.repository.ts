import Database from '@/app/core/database/database';

import type Profile from '@/app/core/database/entities/profile.entity';
import type { FindOptions } from 'sequelize';

export default class ProfileRepository {
  private models = Database.getInstance().models;

  async findAll(): Promise<Profile[]> {
    return this.models.Profile.findAll({
      where: {
        deleted_at: null,
      },
    });
  }

  async findByPk(id: string): Promise<Profile | null> {
    return this.models.Profile.findByPk(id, {
      where: {
        deleted_at: null,
      },
      include: [
        {
          association: 'user',
          required: false,
        },
      ],
    } as FindOptions);
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.models.Profile.findOne({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      include: [
        {
          association: 'user',
          required: false,
        },
      ],
    });
  }

  async create(data: { user_id: string; bio?: string | null; interests?: string[] | null }): Promise<Profile> {
    return this.models.Profile.create({
      user_id: data.user_id,
      bio: data.bio ?? null,
      interests: data.interests ?? null,
    });
  }

  async update(
    id: string,
    data: {
      bio?: string | null;
      interests?: string[] | null;
    },
  ): Promise<[number, Profile[]]> {
    return this.models.Profile.update(data, {
      where: {
        id,
        deleted_at: null,
      },
      returning: true,
    });
  }

  async delete(id: string): Promise<number> {
    // Soft delete - sets deleted_at timestamp
    const [affectedCount] = await this.models.Profile.update(
      {
        deleted_at: new Date(),
      },
      {
        where: {
          id,
          deleted_at: null,
        },
      },
    );
    return affectedCount;
  }

  async restore(id: string): Promise<number> {
    // Restore soft-deleted profile
    const [affectedCount] = await this.models.Profile.update(
      {
        deleted_at: null,
      },
      {
        where: {
          id,
        },
      },
    );
    return affectedCount;
  }
}
