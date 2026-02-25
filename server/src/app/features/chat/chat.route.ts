import { Router } from 'express';

import { AuthMiddleware } from '@/app/core/middleware/auth.middleware';

import ChatController from './chat.controller';
import { validateSendMessage, validateGetMessages } from './chat.validator';

import type { Express } from 'express';

export default class ChatRoute {
  private static instance: ChatRoute;

  private router: Router;

  private controller: ChatController;

  private constructor(app: Express) {
    this.router = Router();
    this.controller = new ChatController();
    this.registerRoutes();
    app.use('/api/chat', this.router);
  }

  static getInstance(app: Express): ChatRoute {
    if (!ChatRoute.instance) {
      ChatRoute.instance = new ChatRoute(app);
    }
    return ChatRoute.instance;
  }

  private registerRoutes(): void {
    // All routes require authentication
    this.router.post('/message', AuthMiddleware.authenticate, validateSendMessage, async (req, res, next) =>
      this.controller.sendMessage(req, res, next),
    );

    this.router.get('/messages', AuthMiddleware.authenticate, validateGetMessages, async (req, res, next) =>
      this.controller.getMessages(req, res, next),
    );

    this.router.get('/rooms', AuthMiddleware.authenticate, async (req, res, next) =>
      this.controller.getRoomList(req, res, next),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
