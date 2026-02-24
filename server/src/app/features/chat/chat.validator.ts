import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const sendMessageSchema = z.object({
  connectionId: z.string().uuid('Invalid connection ID'),
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(5000, 'Message cannot exceed 5000 characters'),
});

export const getMessagesSchema = z.object({
  connectionId: z.string().uuid('Invalid connection ID'),
  limit: z
    .coerce.number()
    .int()
    .min(1, 'Limit must be between 1 and 100')
    .max(100, 'Limit must be between 1 and 100')
    .default(50),
  offset: z
    .coerce.number()
    .int()
    .min(0, 'Offset must be greater than or equal to 0')
    .default(0),
});

export function validateSendMessage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const validated = sendMessageSchema.parse(req.body);
    (req as any).validatedData = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        issues: error.issues,
      });
    } else {
      next(error);
    }
  }
}

export function validateGetMessages(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const validated = getMessagesSchema.parse({
      connectionId: req.query.connectionId,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    (req as any).validatedData = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        issues: error.issues,
      });
    } else {
      next(error);
    }
  }
}
