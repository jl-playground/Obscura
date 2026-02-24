import { QuestionService } from './question.service';

import type { Request, Response, NextFunction } from 'express';

export default class QuestionController {
  private service = new QuestionService();

  getDailyQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const questions = await this.service.getDailyQuestions(userId);
      res.status(200).json({ data: questions });
    } catch (error) {
      next(error);
    }
  };

  submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { questionId, answerValue } = req.body;
      const answer = await this.service.submitAnswer(userId, questionId, answerValue);
      res.status(201).json({ data: answer });
    } catch (error) {
      next(error);
    }
  };

  getUserAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const answers = await this.service.getUserAnswers(userId);
      res.status(200).json({ data: answers });
    } catch (error) {
      next(error);
    }
  };
}
