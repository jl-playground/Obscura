import { Router } from 'express';

import UserController from './user.controller';
import UserValidator from './user.validator';

import type { Application } from 'express';

export default class UserRoute {
  private static instance: UserRoute;

  private readonly router: Router;

  private readonly app: Application;

  private readonly controller: UserController;

  private readonly path = '/api/users';

  private constructor(app: Application) {
    this.app = app;
    this.controller = new UserController();
    this.router = Router();
    this.initializeRoutes();
    this.app.use(this.path, this.router);
  }

  public static getInstance(app?: Application): UserRoute {
    if (UserRoute.instance) return UserRoute.instance;
    if (!app) throw new Error('UserRoute must be initialized with an App instance first');
    UserRoute.instance = new UserRoute(app);
    return UserRoute.instance;
  }

  private initializeRoutes() {
    this.router.get('/', this.controller.getAllUsers.bind(this.controller));
    this.router.get('/:id', this.controller.getUserById.bind(this.controller));
    this.router.post('/', UserValidator.validateCreateUser, this.controller.createUser.bind(this.controller));
    this.router.put('/:id', UserValidator.validateUpdateUser, this.controller.updateUser.bind(this.controller));
    this.router.post('/:id/delete', this.controller.deleteUser.bind(this.controller));
  }
}
