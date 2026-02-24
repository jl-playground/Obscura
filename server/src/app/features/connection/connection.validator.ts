import { z } from 'zod';

import type { Request, Response, NextFunction } from 'express';

const createConnectionSchema = z.object({
  recipientUserId: z.uuid('Invalid recipient user ID'),
});

const revealVoteSchema = z.object({
  vote: z.boolean(),
});

export type CreateConnectionDto = z.infer<typeof createConnectionSchema>;
export type RevealVoteDto = z.infer<typeof revealVoteSchema>;

export class ConnectionValidator {
  static readonly validateCreateConnection = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response<undefined, Record<string, undefined>> | undefined => {
    try {
      const parsed = createConnectionSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }

      req.body = parsed.data;
      next();
    } catch (error) {
      next(error);
    }
  };

  static readonly validateRevealVote = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response<undefined, Record<string, undefined>> | undefined => {
    try {
      const parsed = revealVoteSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: parsed.error.issues,
        });
      }

      req.body = parsed.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
