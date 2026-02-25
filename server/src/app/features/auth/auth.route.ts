import { Router } from 'express';

import AuthController from './auth.controller';

import type { Application } from 'express';

export default class AuthRoute {
  private static instance: AuthRoute;

  private readonly router: Router;

  private readonly app: Application;

  private readonly controller: AuthController;

  private readonly path = '/auth';

  private constructor(app: Application) {
    this.app = app;
    this.controller = new AuthController();
    this.router = Router();
    this.initializeRoutes();
    this.app.use(this.path, this.router);
  }

  public static getInstance(app?: Application): AuthRoute {
    if (AuthRoute.instance) return AuthRoute.instance;
    if (!app) throw new Error('AuthRoute must be initialized with an App instance first');
    AuthRoute.instance = new AuthRoute(app);
    return AuthRoute.instance;
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.controller.register.bind(this.controller));
    this.router.post('/login', this.controller.login.bind(this.controller));
    this.router.post('/validateToken', this.controller.validateToken.bind(this.controller));
    this.router.post('/passwordReset', this.controller.passwordReset.bind(this.controller));
    this.router.post('/newPassword', this.controller.newPassword.bind(this.controller));
    this.router.get('/test', this.controller.validateToken.bind(this.controller));
  }
}
