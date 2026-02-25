import { Router } from 'express';

import { AuthMiddleware } from '@/app/core/middleware/auth.middleware';

import ProfileController from './profile.controller';
import { ProfileValidator } from './profile.validator';

import type { Express } from 'express';

export default class ProfileRoute {
  private static instance: ProfileRoute;

  private router: Router;

  private app: Express;

  private controller: ProfileController;

  private path = '/profile';

  constructor(app: Express) {
    this.app = app;
    this.controller = new ProfileController();
    this.router = Router();
    this.initializeRoutes();
    this.app.use(this.path, this.router);
  }

  static getInstance(app?: Express): ProfileRoute {
    if (!ProfileRoute.instance) {
      if (!app) {
        throw new Error('App instance is required for first initialization');
      }
      ProfileRoute.instance = new ProfileRoute(app);
    }
    return ProfileRoute.instance;
  }

  private initializeRoutes(): void {
    // Get logged-in user's profile
    this.router.get('/me', AuthMiddleware.authenticate, this.controller.getMyProfile.bind(this.controller));

    // Get profile by ID (public)
    this.router.get('/:id', this.controller.getProfileById.bind(this.controller));

    // Update logged-in user's profile
    this.router.put(
      '/me',
      AuthMiddleware.authenticate,
      ProfileValidator.validateUpdateProfile,
      this.controller.updateMyProfile.bind(this.controller),
    );

    // Delete logged-in user's profile (soft delete)
    this.router.delete('/me', AuthMiddleware.authenticate, this.controller.deleteMyProfile.bind(this.controller));
  }
}
