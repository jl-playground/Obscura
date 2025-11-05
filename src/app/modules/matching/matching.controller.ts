import { MatchingService } from "./matching.service";
import type { AuthPayload } from "@/app/modules/auth/auth.dto";
import type { Context } from "elysia";

type AuthContext = { auth: AuthPayload; set: Context["set"] };

export class MatchingController {
  private service = new MatchingService();

  /**
   * Handles GET /matching/batch
   * Fetches the user's daily batch of profiles.
   */
  public async getDailyBatch(context: AuthContext) {
    const { auth, set } = context;
    try {
      const result = await this.service.getDailyBatch(auth);
      set.status = 200; // OK

      // We must filter this data before sending.
      // We only send the *silhouette* and *personality* data,
      // not the real photo URLs.
      const blurredBatch = result.map((profile) => ({
        id: profile.id,
        bio: profile.bio,
        interests: profile.interests,
        silhouette_url: profile.silhouette_url,
        // We explicitly DO NOT send: photo_urls, user_id
      }));

      return { status: "success", data: blurredBatch };
    } catch (error: any) {
      if (error.message.includes("profile could not be found")) {
        set.status = 404; // Not Found
      } else {
        set.status = 500; // Internal Server Error
      }
      return { status: "error", message: error.message };
    }
  }
}
