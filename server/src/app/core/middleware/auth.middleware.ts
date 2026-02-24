import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import type { AuthPayload } from '@/app/features/auth/auth.dto';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 * Token format: "Bearer <token>"
 */
export class AuthMiddleware {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'OBSCURA_DEV_SECRET_KEY';

  static authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(createHttpError.Unauthorized('Missing or invalid authorization header'));
        return;
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      const decoded = jwt.verify(token, AuthMiddleware.JWT_SECRET) as AuthPayload;

      req.user = decoded;

      next();
    } catch (error) {
      next(createHttpError.Unauthorized('Invalid or expired token'));
    }
  };

  /**
   * Generate JWT token (use in User Service after login)
   */
  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      {
        id: userId,
        email,
      },
      AuthMiddleware.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );
  }
}
