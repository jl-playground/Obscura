import { dataSource } from "@/core/db/dataSource"; // Corrected to 'dataSource'
import { Profile } from "../../../core/db/entities/profile.entity";
import type { User } from "@/core/db/entities/user.entity";

export const ProfileRepository = dataSource.getRepository(Profile).extend({
  /**
   * Finds a profile by its associated user ID.
   */
  findByUserId(userId: string) {
    return this.findOne({
      where: { user_id: userId },
      relations: ["user"],
    });
  },

  /**
   * Creates and saves a new, empty profile for a user during registration.
   */
  async createEmptyProfileForUser(user: User): Promise<Profile> {
    // We are no longer sending bio, interests, or photo_urls.
    const newProfile = this.create({
      user: user,
      silhouette_url: "default-silhouette-placeholder.png",
    });

    return this.save(newProfile);
  },

  /**
   * Updates the profile's silhouette URL.
   */
  updateSilhouette(profileId: string, silhouetteUrl: string) {
    return this.update(profileId, {
      silhouette_url: silhouetteUrl,
    });
  },
});
