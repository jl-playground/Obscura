import { z } from 'zod';

import type { Request, Response, NextFunction } from 'express';

export default class UserValidator {
  private static readonly createUserSchema = z.object({
    email: z.email('Invalid email format'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

  private static readonly updateUserSchema = z.object({
    email: z.email('Invalid email format').optional(),
    first_name: z.string().min(1, 'First name is required').optional(),
    last_name: z.string().min(1, 'Last name is required').optional(),
  });

  public static validateCreateUser(req: Request, res: Response, next: NextFunction): undefined | Response {
    const result = UserValidator.createUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error.issues[0].message,
      });
    }
    next();
  }

  public static validateUpdateUser(req: Request, res: Response, next: NextFunction): undefined | Response {
    const result = UserValidator.updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error.issues[0].message,
      });
    }
    next();
  }
}
