import { dataSource } from "@/core/db/dataSource";
import { UserAnswer } from "@/core/db/entities/userAnswer.entity";

export const UserAnswerRepository = dataSource
  .getRepository(UserAnswer)
  .extend({
    /**
     * Fetches all answers for a specific user.
     * @param userId - The user's ID.
     * @returns An array of UserAnswer entities.
     */
    findAllByUserId (userId: string) {
      return this.find({
        where: { user_id: userId },
        relations: ["question"], // Include the question details
      });
    },
  });
