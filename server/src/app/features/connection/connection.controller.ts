import ConnectionService from './connection.service';

import type { CreateConnectionDto, RevealVoteDto } from './connection.validator';
import type { Request, Response, NextFunction } from 'express';

export default class ConnectionController {
  private service: ConnectionService;

  constructor() {
    this.service = new ConnectionService();
  }

  async createConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { recipientUserId } = req.body as CreateConnectionDto;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const connection = await this.service.createConnection(userId, recipientUserId);

      res.status(201).json({
        message: 'Connection created successfully',
        data: connection,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const connections = await this.service.getUserConnections(userId);

      res.status(200).json({
        message: 'Connections retrieved successfully',
        data: connections,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConnectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const connectionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const connection = await this.service.getConnectionById(connectionId);

      // Verify user is part of connection
      const isPartOfConnection = await this.service.verifyUserInConnection(connectionId, userId);

      if (!isPartOfConnection) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      res.status(200).json({
        message: 'Connection retrieved successfully',
        data: connection,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleRevealVote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const connectionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { vote } = req.body as RevealVoteDto;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Verify user is part of connection
      const isPartOfConnection = await this.service.verifyUserInConnection(connectionId, userId);

      if (!isPartOfConnection) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const connection = await this.service.handleRevealVote(connectionId, userId, vote);

      res.status(200).json({
        message: 'Reveal vote recorded successfully',
        data: connection,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const connectionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Verify user is part of connection
      const isPartOfConnection = await this.service.verifyUserInConnection(connectionId, userId);

      if (!isPartOfConnection) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      await this.service.deleteConnection(connectionId);

      res.status(200).json({
        message: 'Connection deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
