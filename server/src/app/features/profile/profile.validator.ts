import { z } from 'zod';

import type { Request, Response, NextFunction } from 'express';

export const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests allowed').optional().nullable(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export class ProfileValidator {
  static readonly validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = updateProfileSchema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: z.treeifyError(error),
        });
        return;
      }

      res.status(400).json({
        status: 'error',
        message: 'Invalid request body',
      });
    }
  };
}
