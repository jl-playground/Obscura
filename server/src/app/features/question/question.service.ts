import QuestionRepository from './question.repository';
import { UserAnswerRepository } from './userAnswer.repository';
import type { CreationAttributes } from 'sequelize';
import type Question from '@/app/core/database/entities/question.entity';
import UserAnswer from '@/app/core/database/entities/userAnswer.entity';

export class QuestionService {
  private questionRepository = new QuestionRepository();
  private answerRepository = new UserAnswerRepository();

  async getDailyQuestions(userId: string): Promise<Question[]> {
    const questions = await this.questionRepository.getDailyQuestions(userId);
    if (questions.length === 0) {
      throw new Error('No unanswered questions available');
    }
    return questions;
  }

  async submitAnswer(userId: string, questionId: string, answerValue: string): Promise<UserAnswer> {
    // Validate question exists
    const question = await this.questionRepository.findByPk(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Create or update answer
    const answer = await this.answerRepository.updateOrCreate(userId, questionId, answerValue);
    return answer;
  }

  async getUserAnswers(userId: string): Promise<UserAnswer[]> {
    return this.answerRepository.findAllByUserId(userId);
  }

  async getAllQuestions(): Promise<Question[]> {
    return this.questionRepository.findAll();
  }

  async getQuestionById(id: string): Promise<Question | null> {
    return this.questionRepository.findByPk(id);
  }

  async createQuestion(data: CreationAttributes<Question>): Promise<Question> {
    return this.questionRepository.create(data);
  }

  async updateQuestion(id: string, data: Partial<CreationAttributes<Question>>): Promise<Question | null> {
    return this.questionRepository.update(id, data);
  }

  async deleteQuestion(id: string): Promise<number> {
    return this.questionRepository.delete(id);
  }

  async restoreQuestion(id: string): Promise<number> {
    return this.questionRepository.restore(id);
  }
}
