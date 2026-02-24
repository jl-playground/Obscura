import AuthService from './auth.service';

import type { LoginDto, RegisterDto } from './auth.dto';
import type { Request, Response, NextFunction } from 'express';

export default class AuthController {
  private readonly authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body as RegisterDto);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body as LoginDto);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.validateToken(req.body as { token: string });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public passwordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.passwordReset(req.body as { email: string });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public newPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.newPassword(
        req.body as {
          temporaryToken: string;
          newPassword: string;
          confirmPassword: string;
        },
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
