import { Op } from 'sequelize';

import { questionConfig } from '@/app/config/question.config';
import Database from '@/app/core/database/database';

import type Question from '@/app/core/database/entities/question.entity';
import type UserAnswer from '@/app/core/database/entities/userAnswer.entity';
import type { CreationAttributes, FindOptions } from 'sequelize';

export default class QuestionRepository {
  private models = Database.getInstance().models;

  private sequelize = Database.getInstance().sequelize;

  async findAll(): Promise<Question[]> {
    return this.models.Question.findAll();
  }

  async findByPk(id: string): Promise<Question | null> {
    return this.models.Question.findByPk(id, {
      include: [
        {
          model: this.models.UserAnswer,
          as: 'userAnswers',
        },
      ],
    });
  }

  async getDailyQuestions(userId: string, limit: number = questionConfig.DAILY_QUESTION_LIMIT): Promise<Question[]> {
    // Find all question IDs that user has already answered
    const answeredQuestions = await this.models.UserAnswer.findAll({
      where: { user_id: userId },
      attributes: ['question_id'],
      raw: true,
    });

    const answeredQuestionIds = answeredQuestions.map((a: UserAnswer) => a.question_id);

    // Build query options
    const queryOptions: FindOptions = {
      where: {
        id: {
          [Op.notIn]: answeredQuestionIds.length > 0 ? answeredQuestionIds : [],
        },
        deleted_at: null, // Exclude soft-deleted questions
      },
      limit,
    };

    // Add randomization if enabled
    if (questionConfig.RANDOMIZE_QUESTIONS) {
      queryOptions.order = [[this.sequelize.fn('RAND'), 'ASC']];
    }
    return this.models.Question.findAll(queryOptions);
  }

  async create(data: CreationAttributes<Question>): Promise<Question> {
    return this.models.Question.create(data);
  }

  async update(id: string, data: Partial<CreationAttributes<Question>>): Promise<Question | null> {
    const question = await this.findByPk(id);
    if (!question) return null;
    return question.update(data as Question);
  }

  async delete(id: string): Promise<number> {
    return this.models.Question.destroy({ where: { id } });
  }

  async restore(id: string): Promise<number> {
    await this.models.Question.restore({ where: { id } });
    return this.models.Question.count({ where: { id } });
  }
}
