import { z } from 'zod';

import type { Request, Response, NextFunction } from 'express';

export default class MatchingValidator {
  private static readonly passProfileSchema = z.object({
    passedProfileId: z.uuid({ message: 'Invalid profile ID' }),
  });

  private static readonly matchProfileSchema = z.object({
    matchedProfileId: z.uuid({ message: 'Invalid profile ID' }),
  });

  public static validatePassProfile(req: Request, res: Response, next: NextFunction): void {
    const result = MatchingValidator.passProfileSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: result.error.issues[0].message,
      });
      return;
    }
    req.body = result.data;
    next();
  }

  public static validateMatchProfile(req: Request, res: Response, next: NextFunction): void {
    const result = MatchingValidator.matchProfileSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: result.error.issues[0].message,
      });
      return;
    }
    req.body = result.data;
    next();
  }
}
