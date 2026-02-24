import { Router } from 'express';

import { AuthMiddleware } from '@/app/core/middleware/auth.middleware';

import MatchingController from './matching.controller';
import MatchingValidator from './matching.validator.js';

import type { Express } from 'express';

export default class MatchingRoute {
  private static instance: MatchingRoute;

  private router: Router;

  private path = '/matching';

  private constructor(app: Express) {
    this.router = Router();
    this.initializeRoutes();
    // Mount router at /api/matching
    app.use(`/api${this.path}`, this.router);
  }

  public static getInstance(app?: Express): MatchingRoute {
    if (!MatchingRoute.instance && app) {
      MatchingRoute.instance = new MatchingRoute(app);
    }
    return MatchingRoute.instance;
  }

  private initializeRoutes(): void {
    const controller = new MatchingController();

    this.router.get('/batch', AuthMiddleware.authenticate, controller.getDailyBatch);

    this.router.post(
      '/pass',
      AuthMiddleware.authenticate,
      MatchingValidator.validatePassProfile,
      controller.passProfile,
    );

    this.router.post(
      '/match',
      AuthMiddleware.authenticate,
      MatchingValidator.validateMatchProfile,
      controller.matchProfile,
    );

    this.router.post('/revertAllPasses', AuthMiddleware.authenticate, controller.revertAllPasses);
  }
}
