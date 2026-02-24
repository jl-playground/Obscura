import { Op } from 'sequelize';

import Database from '@/app/core/database/database';

import type DailyBatch from '@/app/core/database/entities/dailyBatch.entity';
import type { CreationAttributes } from 'sequelize';

export default class DailyBatchRepository {
  private models = Database.getInstance().models;

  /**
   * Finds the most recent valid (less than 24 hours old) batch
   * for a specific user.
   * @param userId - The user's ID.
   * @returns A DailyBatch entity or null.
   */
  async findValidBatchByUserId(userId: string): Promise<DailyBatch | null> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.models.DailyBatch.findOne({
      where: {
        user_id: userId,
        created_at: {
          [Op.gt]: twentyFourHoursAgo,
        },
      },
      order: [['created_at', 'DESC']],
    });
  }

  async save(data: CreationAttributes<DailyBatch>): Promise<DailyBatch> {
    return this.models.DailyBatch.create(data);
  }

  async update(id: string, data: Partial<DailyBatch>): Promise<[number, DailyBatch[]]> {
    return this.models.DailyBatch.update(data, {
      where: { id },
      returning: true,
    });
  }
}
