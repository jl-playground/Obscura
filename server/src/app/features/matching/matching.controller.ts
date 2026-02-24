import MatchingService from './matching.service';

import type Profile from '@/app/core/database/entities/profile.entity';
import type { AuthenticatedRequest } from '@/app/core/middleware/auth.middleware';
import type { PassPayload } from '@/app/features/auth/auth.dto';
import type { Response, NextFunction } from 'express';

export default class MatchingController {
  private service = new MatchingService();

  /**
   * Handles GET /api/matching/batch
   * Fetches the user's daily batch of profiles.
   */
  public getDailyBatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    try {
      const auth = req.user;
      const result = await this.service.getDailyBatch(auth);

      // Map the array to remove sensitive fields just like the original logic did
      const blurredBatch = result.map((profile: Profile) => ({
        id: profile.id,
        bio: profile.bio,
        interests: profile.interests,
        silhouette_url: profile,
      }));

      res.status(200).json({ status: 'success', data: blurredBatch });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('profile could not be found')) {
          res.status(404).json({ status: 'error', message: error.message });
        }
      }
      next(error);
    }
  };

  /**
   * Handles POST /api/matching/pass
   */
  public passProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    try {
      const { passedProfileId } = req.body;
      const { userId } = req.user;

      await this.service.passProfile({ userId, passedProfileId });

      res.status(200).json({ status: 'success', data: null });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('profile could not be found')) {
          res.status(404).json({ status: 'error', message: error.message });
        }
      }
      next(error);
    }
  };

  /**
   * Handles POST /api/matching/match
   */
  public matchProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    try {
      const { matchedProfileId } = req.body;
      const { userId } = req.user;

      await this.service.matchProfile({ userId, matchedProfileId });

      res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('profile could not be found')) {
          res.status(404).json({ status: 'error', message: error.message });
        }
        next(error);
      }
    }
  };

  /**
   * Handles POST /api/matching/revertAllPasses
   */
  public revertAllPasses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    try {
      const auth = req.user as unknown;
      await this.service.revertAllPasses(auth as PassPayload);

      res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('profile could not be found')) {
          res.status(404).json({ status: 'error', message: error.message });
        }
      }
      next(error);
    }
  };
}
