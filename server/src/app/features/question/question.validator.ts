import { z } from 'zod';

import type { Request, Response, NextFunction } from 'express';

export default class QuestionValidator {
  static readonly submitAnswerSchema = z.object({
    questionId: z.uuid('Invalid question ID format'),
    answerValue: z.string().min(1, 'Answer value is required'),
  });

  static readonly validateSubmitAnswer = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = QuestionValidator.submitAnswerSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          message: 'Validation failed',
          errors: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
