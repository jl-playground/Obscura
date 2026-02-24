import { Router, Express } from 'express';
import QuestionController from './question.controller';
import QuestionValidator from './question.validator';
import { AuthMiddleware } from '@/app/core/middleware/auth.middleware';

export default class QuestionRoute {
  private static instance: QuestionRoute;
  private router: Router;
  private app: Express;
  private controller: QuestionController;
  private path = '/question';

  private constructor(app?: Express) {
    this.app = app!;
    this.controller = new QuestionController();
    this.router = Router();
    this.initializeRoutes();

    if (this.app) {
      this.app.use(`/api${this.path}`, this.router);
    }
  }

  static getInstance(app?: Express): QuestionRoute {
    if (!QuestionRoute.instance) {
      QuestionRoute.instance = new QuestionRoute(app);
    }
    return QuestionRoute.instance;
  }

  private initializeRoutes(): void {
    // User endpoints (protected)
    this.router.get('/daily', AuthMiddleware.authenticate, this.controller.getDailyQuestions.bind(this.controller));
    this.router.get('/answers', AuthMiddleware.authenticate, this.controller.getUserAnswers.bind(this.controller));
    this.router.post(
      '/answer',
      AuthMiddleware.authenticate,
      QuestionValidator.validateSubmitAnswer,
      this.controller.submitAnswer.bind(this.controller),
    );
  }
}
