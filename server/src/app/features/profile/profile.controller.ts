import { ProfileService } from './profile.service';

import type { AuthenticatedRequest } from '@/app/core/middleware/auth.middleware';
import type { Request, Response, NextFunction } from 'express';

export default class ProfileController {
  private service: ProfileService;

  constructor() {
    this.service = new ProfileService();
  }

  getMyProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const profile = await this.service.getProfileByUserId(req.user.userId);

      res.status(200).json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfileById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const profile = await this.service.getProfileById(profileId);

      res.status(200).json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMyProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const userProfile = await this.service.getProfileByUserId(req.user.userId);

      const updatedProfile = await this.service.updateProfile(userProfile.id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMyProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const userProfile = await this.service.getProfileByUserId(req.user.userId);

      await this.service.deleteProfile(userProfile.id);

      res.status(200).json({
        status: 'success',
        message: 'Profile deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
