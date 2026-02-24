import ProfileRepository from './profile.repository';

import type Profile from '@/app/core/database/entities/profile.entity';

export interface UpdateProfileDto {
  bio?: string | null;
  interests?: string[] | null;
}

export class ProfileService {
  private repository: ProfileRepository;

  constructor() {
    this.repository = new ProfileRepository();
  }

  async getProfileById(profileId: string): Promise<Profile> {
    const profile = await this.repository.findByPk(profileId);

    if (!profile) {
      throw new Error(`Profile with id ${profileId} not found`);
    }

    return profile;
  }

  async getProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.repository.findByUserId(userId);

    if (!profile) {
      throw new Error(`Profile for user ${userId} not found`);
    }

    return profile;
  }

  async updateProfile(profileId: string, dto: UpdateProfileDto): Promise<Profile> {
    // Validate interests array
    if (dto.interests && dto.interests.length > 10) {
      throw new Error('Maximum 10 interests allowed');
    }

    // Validate bio length
    if (dto.bio && dto.bio.length > 500) {
      throw new Error('Bio must be less than 500 characters');
    }

    const [, updatedProfiles] = await this.repository.update(profileId, dto);

    if (updatedProfiles.length === 0) {
      throw new Error(`Profile with id ${profileId} not found`);
    }

    return updatedProfiles[0];
  }

  async createEmptyProfileForUser(userId: string): Promise<Profile> {
    const profile = await this.repository.create({
      user_id: userId,
      bio: null,
      interests: null,
    });

    return profile;
  }

  async deleteProfile(profileId: string): Promise<void> {
    const result = await this.repository.delete(profileId);

    if (result === 0) {
      throw new Error(`Profile with id ${profileId} not found`);
    }
  }

  async restoreProfile(profileId: string): Promise<void> {
    const result = await this.repository.restore(profileId);

    if (result === 0) {
      throw new Error(`Profile with id ${profileId} not found`);
    }
  }
}
