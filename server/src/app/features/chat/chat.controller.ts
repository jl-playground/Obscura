import { Request, Response, NextFunction } from 'express';
import ChatService from './chat.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export default class ChatController {
  private chatService = new ChatService();

  /**
   * POST /api/chat/message
   * Send a message in a connection's room
   */
  async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { connectionId, content } = (req as any).validatedData;

      const message = await this.chatService.sendMessage(
        userId,
        connectionId,
        content
      );

      res.status(201).json({
        id: message.id,
        room_id: message.room_id,
        sender_id: message.sender_id,
        content: message.content,
        created_at: message.created_at,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Connection not found' ||
          error.message === 'User is not part of this connection'
        ) {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * GET /api/chat/messages
   * Get paginated messages for a connection
   */
  async getMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { connectionId, limit, offset } = (req as any).validatedData;

      const result = await this.chatService.getMessages(
        userId,
        connectionId,
        limit,
        offset
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Connection not found' ||
          error.message === 'User is not part of this connection'
        ) {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * GET /api/chat/rooms
   * Get all rooms for authenticated user
   */
  async getRoomList(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const rooms = await this.chatService.getRoomList(userId);

      res.status(200).json({
        rooms,
        total: rooms.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
