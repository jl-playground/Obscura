import { ProfileRepository } from "./profile.repository";
import { UserRepository } from "@/app/modules/user/user.repository";
import type { UpdateProfileDto } from "./profile.dto";

export class ProfileService {
  private profileRepository = ProfileRepository;
  private userRepository = UserRepository;

  /**
   * Fetches a single profile by its ID.
   * @param profileId - The UUID of the profile to fetch.
   */
  public async getProfileById (profileId: string) {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: { user: true } // Also fetch the user data
    });

    if (!profile) throw new Error("Profile not found.");

    return profile;
  }

  /**
   * Updates a user's profile.
   * @param profileId - The UUID of the profile to update.
   * @param dto - The new data (bio, interests, photos, silhouette).
   */
  public async updateProfile (profileId: string, dto: UpdateProfileDto) {
    const profile = await this.profileRepository.findOneBy({ id: profileId });
    if (!profile) {
      throw new Error("Profile not found.");
    }

    // If new photos are provided, a new silhouette MUST also be provided.
    // This enforces our "blurred" mechanic at the API level.
    if (dto.photo_urls && !dto.silhouette_url) {
      throw new Error("Updating photos requires a new silhouette_url.");
    }


    const updatedProfileData = {
      ...profile,
      ...dto,
    };

    const updatedProfile = await this.profileRepository.save(updatedProfileData);

    return {
      status: "success",
      message: "Profile updated.",
      profile: updatedProfile,
    };
  }
}