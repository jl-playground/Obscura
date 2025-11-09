import { dataSource } from "@/core/db/dataSource";
import { MoreThan } from "typeorm";
import { DailyBatch } from "@/core/db/entities/dailyBatch.entity";

export const DailyBatchRepository = dataSource
  .getRepository(DailyBatch)
  .extend({
    /**
     * Finds the most recent valid (less than 24 hours old) batch
     * for a specific user.
     * @param userId - The user's ID.
     * @returns A DailyBatch entity or null.
     */
    findValidBatchByUserId (userId: string) {
      // Calculate 24 hours ago
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      return this.findOne({
        where: {
          user_id: userId,
          created_at: MoreThan(twentyFourHoursAgo), // 'MoreThan' is a TypeORM finder
        },
        order: {
          created_at: "DESC", // Get the newest one
        },
      });
    },
  });
