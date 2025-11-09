import { ProfileService } from "./profile.service";
import type { AuthContext, GetByIdContext, UpdateContext } from "./profile.types";



export class ProfileController {
  private profileService = new ProfileService();

  /**
   * Handles GET /profiles/me
   */
  public async getMyProfile (context: AuthContext) {
    const { auth, set } = context; // We destructure inside
    try {
      const profile = await this.profileService.getProfileById(auth.profileId);
      return { status: "success", data: profile };
    } catch (error: any) {
      set.status = 404; // Not Found
      return { status: "error", message: error.message };
    }
  }

  /**
   * Handles PATCH /profiles/me
   */
  // --- FIX IS HERE ---
  public async updateMyProfile (context: UpdateContext) {
    const { auth, body, set } = context; // We destructure inside
    try {
      const result = await this.profileService.updateProfile(auth.profileId, body);
      return { status: "success", data: result };
    } catch (error: any) {
      set.status = 400; // Bad Request
      return { status: "error", message: error.message };
    }
  }

  /**
   * Handles GET /profiles/:id
   */
  // --- FIX IS HERE ---
  public async getProfileById (context: GetByIdContext) {
    const { params, auth, set } = context; // We destructure inside
    try {
      const profile = await this.profileService.getProfileById(params.id);

      // TODO: Filter this to return the 'Silhouette' version.

      return { status: "success", data: profile };
    } catch (error: any) {
      set.status = 404; // Not Found
      return { status: "error", message: error.message };
    }
  }
}
