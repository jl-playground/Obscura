import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import type { AuthPayload } from '@/app/features/auth/auth.dto';
import type { NextFunction, Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET ?? 'OBSCURA_DEV_SECRET_KEY';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, _: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      next(createHttpError.Unauthorized('No authorization token provided'));
      return;
    }

    const token = authHeader.split(' ')[1];

    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;

    req.user = payload;

    next();
  } catch (error) {
    console.log('Authentication error:', error);
    next(createHttpError.Unauthorized('Invalid or expired token'));
  }
};
