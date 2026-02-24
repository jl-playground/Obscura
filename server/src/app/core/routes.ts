import type { Application, Express } from 'express';
import AuthRoute from '@/app/features/auth/auth.route';
import UserRoute from '@/app/features/user/user.route';
import ProfileRoute from '@/app/features/profile/profile.route';
import ConnectionRoute from '@/app/features/connection/connection.route';
import QuestionRoute from '@/app/features/question/question.route';
import ChatRoute from '@/app/features/chat/chat.route';
import MatchingRoute from '@/app/features/matching/matching.route';

export default class Routes {
  private static instance: Routes;

  private readonly app: Application;

  private constructor(app: Application) {
    this.app = app;
    this.registerRoutes();
  }

  public static getInstance(app?: Application): Routes {
    if (Routes.instance) return Routes.instance;
    if (!app) throw new Error('Routes not initialized with app instance');

    Routes.instance = new Routes(app);
    return Routes.instance;
  }

  private registerRoutes(): void {
    AuthRoute.getInstance(this.app as Express);
    UserRoute.getInstance(this.app as Express);
    ProfileRoute.getInstance(this.app as Express);
    ConnectionRoute.getInstance(this.app as Express);
    QuestionRoute.getInstance(this.app as Express);
    ChatRoute.getInstance(this.app as Express);
    MatchingRoute.getInstance(this.app as Express);
  }
}
