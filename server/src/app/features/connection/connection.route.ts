import { Router } from 'express';

import { AuthMiddleware } from '@/app/core/middleware/auth.middleware';

import ConnectionController from './connection.controller';
import { ConnectionValidator } from './connection.validator';

import type { Express } from 'express';

export class ConnectionRoute {
  private static instance: ConnectionRoute;

  private router: Router;

  private app: Express;

  private controller: ConnectionController;

  private path = '/connection';

  private constructor(app: Express) {
    this.app = app;
    this.controller = new ConnectionController();
    this.router = Router();
    this.initializeRoutes();
    this.app.use(`/api${this.path}`, this.router);
  }

  static getInstance(app?: Express): ConnectionRoute {
    if (!ConnectionRoute.instance) {
      if (!app) {
        throw new Error('App is required for first initialization');
      }
      ConnectionRoute.instance = new ConnectionRoute(app);
    }
    return ConnectionRoute.instance;
  }

  private initializeRoutes(): void {
    this.router.get('/', AuthMiddleware.authenticate, this.controller.getMyConnections.bind(this.controller));
    this.router.get('/:id', AuthMiddleware.authenticate, this.controller.getConnectionById.bind(this.controller));
    this.router.post(
      '/',
      AuthMiddleware.authenticate,
      ConnectionValidator.validateCreateConnection,
      this.controller.createConnection.bind(this.controller),
    );
    this.router.post(
      '/:id/reveal-vote',
      AuthMiddleware.authenticate,
      ConnectionValidator.validateRevealVote,
      this.controller.handleRevealVote.bind(this.controller),
    );
  }
}

export default ConnectionRoute;
