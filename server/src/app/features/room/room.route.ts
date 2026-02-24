import { Router, Express } from 'express';
import RoomController from './room.controller';
import { authMiddleware } from '../auth/auth.middleware';

export default class RoomRoutes {
  private static instance: RoomRoutes;
  private router: Router;
  private app: Express;
  private controller: RoomController;
  private path = '/rooms';

  private constructor(app?: Express) {
    this.app = app!;
    this.controller = new RoomController();
    this.router = Router();
    this.initializeRoutes();

    if (this.app) {
      this.app.use(this.path, this.router);
    }
  }

  static getInstance(app?: Express): RoomRoutes {
    if (!RoomRoutes.instance) {
      RoomRoutes.instance = new RoomRoutes(app);
    }
    return RoomRoutes.instance;
  }

  private initializeRoutes(): void {
    this.router.get('/test', (req, res) => {
      res.status(200).json({ message: 'Room route works!' });
    });

    this.router.get('/', authMiddleware, this.controller.list.bind(this.controller));
    this.router.get('/:roomId', authMiddleware, this.controller.getRoomMessages.bind(this.controller));
  }
}
