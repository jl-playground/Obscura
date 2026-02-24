import { promises as fs } from 'node:fs';
import { join } from 'node:path';

import { Router } from 'express';
import createHttpError from 'http-errors';

import type { Application, Request, Response, NextFunction } from 'express';

type RedirectEnvVar = 'RESET_PASSWORD_MOBILE_URL' | 'VERIFY_EMAIL_MOBILE_URL';

export default class RedirectRoute {
  private static instance: RedirectRoute;

  private readonly router: Router;

  private readonly app: Application;

  private readonly path = '/redirect';

  private readonly templatePath = join(__dirname, 'templates', 'redirect.html');

  private templateCache: string | null = null;

  private constructor(app: Application) {
    this.app = app;
    this.router = Router();
    this.initializeRoutes();
    this.app.use(this.path, this.router);
  }

  public static getInstance(app?: Application): RedirectRoute {
    if (RedirectRoute.instance) return RedirectRoute.instance;
    if (!app) throw new Error('RedirectRoute must be initialized with an App instance first');
    RedirectRoute.instance = new RedirectRoute(app);
    return RedirectRoute.instance;
  }

  private initializeRoutes(): void {
    this.router.get('/auth/reset-password', this.createRedirectHandler('RESET_PASSWORD_MOBILE_URL'));
    this.router.get('/auth/verify-email', this.createRedirectHandler('VERIFY_EMAIL_MOBILE_URL'));
  }

  private createRedirectHandler(envVar: RedirectEnvVar) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const token = this.extractToken(req);
        if (!token) {
          res.status(400).send('Missing token');
          return;
        }

        const deepLinkBase = process.env[envVar];
        if (!deepLinkBase) {
          next(createHttpError.InternalServerError(`${envVar} is not configured`));
          return;
        }

        const html = await this.renderHtml(`${deepLinkBase}${token}`);
        res.status(200).contentType('text/html; charset=utf-8').send(html);
      } catch (error) {
        next(error);
      }
    };
  }

  private extractToken(req: Request): string | undefined {
    const rawToken = req.query?.token;
    if (Array.isArray(rawToken)) {
      return rawToken[0] as string;
    }
    return typeof rawToken === 'string' ? rawToken : undefined;
  }

  private async renderHtml(deepLink: string): Promise<string> {
    const template = await this.readTemplate();
    const replacedTemplate = template.replaceAll('{{DEEP_LINK}}', deepLink);
    return replacedTemplate as string;
  }

  private async readTemplate(): Promise<string> {
    if (this.templateCache) return this.templateCache;
    const template = await fs.readFile(this.templatePath, 'utf-8');
    this.templateCache = template;
    return template;
  }
}
