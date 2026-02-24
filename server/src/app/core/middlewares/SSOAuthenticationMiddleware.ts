import type { Application, NextFunction, Request, Response } from 'express';

export default class SSOAuthenticationMiddleware {
  private static instance: SSOAuthenticationMiddleware;

  private app: Application;

  private constructor(app: Application) {
    this.app = app;
    this.initializeServerAuth();
  }

  public static getInstance(app?: Application): SSOAuthenticationMiddleware {
    if (SSOAuthenticationMiddleware.instance) return SSOAuthenticationMiddleware.instance;
    if (!app) throw new Error('SSOAuthenticationMiddleware not initialized with app instance');

    SSOAuthenticationMiddleware.instance = new SSOAuthenticationMiddleware(app);
    return SSOAuthenticationMiddleware.instance;
  }

  private initializeServerAuth(): void {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/health' || req.path === '/') {
        next();
        return;
      }

      const clientSecret = req.headers['x-argus-secret'];
      const serverSecret = process.env.ARGUS_SERVER_SECRET;

      if (clientSecret !== serverSecret) {
        return res.status(403).json({
          status: 403,
          message: 'Forbidden: Invalid or missing Server Credentials',
        });
      }

      next();
    });
  }
}
