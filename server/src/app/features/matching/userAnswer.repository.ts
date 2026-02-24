import Database from '@/app/core/database/database';

import type UserAnswer from '@/app/core/database/entities/userAnswer.entity';

export default class UserAnswerRepository {
  private models = Database.getInstance().models;

  /**
   * Fetches all answers for a specific user.
   * @param userId - The user's ID.
   * @returns An array of UserAnswer entities.
   */
  async findAllByUserId(userId: string): Promise<UserAnswer[]> {
    return this.models.UserAnswer.findAll({
      where: { user_id: userId },
      include: [
        {
          association: 'question',
          required: false,
        },
      ],
    });
  }
}
