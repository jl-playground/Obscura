import { dataSource } from "@/core/db/dataSource";
import { Profile } from "./profile.entity";
import type { User } from "@/app/modules/user/user.entity"; // Use 'import type' for safety

// This is a TypeORM custom repository.
// We extend the base Repository to add our own custom query methods.

export const ProfileRepository = dataSource.getRepository(Profile).extend({
  /**
   * Finds a profile by its associated user ID.
   * @param userId - The UUID of the user.
   * @returns A Profile entity or null.
   */
  findByUserId (userId: string) {
    return this.findOne({
      where: { user_id: userId },
      relations: ["user"], // 'user' matches the relation name in Profile entity
    });
  },

  /**
   * Creates and saves a new, empty profile for a user during registration.
   * This is a critical dependency for AuthService.
   * @param user - The User entity to link to.
   * @returns The newly created Profile entity.
   */
  async createEmptyProfileForUser (user: User): Promise<Profile> {
    const newProfile = this.create({
      user: user, // TypeORM is smart enough to handle the relation
      bio: "", // Default empty bio
      interests: [],
      photo_urls: [],
      // We will generate the real silhouette in the profile service later
      silhouette_url: "default-silhouette-placeholder.png",
    });

    return this.save(newProfile);
  },

  /**
   * Updates the profile's silhouette URL.
   * @param profileId - The UUID of the profile.
   * @param silhouetteUrl - The new URL for the blurred image.
   */
  updateSilhouette (profileId: string, silhouetteUrl: string) {
    return this.update(profileId, {
      silhouette_url: silhouetteUrl,
    });
  },
});