import Database from '@/app/core/database/database';
import type { CreationAttributes } from 'sequelize';
import type UserAnswer from '@/app/core/database/entities/userAnswer.entity';

export class UserAnswerRepository {
  private models = Database.getInstance().models;

  async findByUserIdAndQuestionId(userId: string, questionId: string): Promise<UserAnswer | null> {
    return this.models.UserAnswer.findOne({
      where: { user_id: userId, question_id: questionId },
      include: [
        {
          model: this.models.Question,
          as: 'question',
        },
      ],
    });
  }

  async findAllByUserId(userId: string): Promise<UserAnswer[]> {
    return this.models.UserAnswer.findAll({
      where: { user_id: userId },
      include: [
        {
          model: this.models.Question,
          as: 'question',
        },
      ],
    });
  }

  async create(data: CreationAttributes<UserAnswer>): Promise<UserAnswer> {
    return this.models.UserAnswer.create(data);
  }

  async update(id: string, data: Partial<CreationAttributes<UserAnswer>>): Promise<UserAnswer | null> {
    const answer = await this.models.UserAnswer.findByPk(id);
    if (!answer) return null;
    return answer.update(data);
  }

  async updateOrCreate(userId: string, questionId: string, answerValue: string): Promise<UserAnswer> {
    const [answer] = await this.models.UserAnswer.findOrCreate({
      where: { user_id: userId, question_id: questionId },
      defaults: { answer_value: answerValue },
    });

    if (answer.answer_value !== answerValue) {
      await answer.update({ answer_value: answerValue });
    }

    return answer;
  }

  async delete(id: string): Promise<number> {
    return this.models.UserAnswer.destroy({ where: { id } });
  }
}
