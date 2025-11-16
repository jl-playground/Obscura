import { MatchingService } from "./matching.service";
import type {
  AuthPayload,
  PassPayload,
  MatchPayload,
} from "@/app/features/auth/auth.dto";
import type { Context } from "elysia";

type AuthContext = { auth: AuthPayload; set: Context["set"] };
type PassContext = {
  auth: PassPayload;
  set: Context["set"];
  body: PassPayload;
};

type MatchContext = {
  auth: PassPayload;
  set: Context["set"];
  body: MatchPayload;
};

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

      set.status = 200;

      const blurredBatch = result.map((profile) => ({
        id: profile.id,
        bio: profile.bio,
        interests: profile.interests,
        silhouette_url: profile.silhouette_url,
      }));

      return { status: "success", data: blurredBatch };
    } catch (error: any) {
      if (error.message.includes("profile could not be found")) {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return {
        status: "error",
        message: error.message,
        statusCode: set.status,
      };
    }
  }

  public async passProfile(context: PassContext) {
    const { set, body } = context;

    try {
      await this.service.passProfile(body);
      set.status = 200;
      return { status: "success", data: null };
    } catch (error: any) {
      if (error.message.includes("profile could not be found")) {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { status: "error", message: error.message };
    }
  }

  public async matchProfile(context: MatchContext) {
    const { set, body, auth } = context;

    try {
      await this.service.matchProfile({ ...body, userId: auth.userId });
      set.status = 200;
      return { status: "success", data: null };
    } catch (error: any) {
      if (error.message.includes("profile could not be found")) {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { status: "error", message: error.message };
    }
  }
  public async revertAllPasses(context: PassContext) {
    const { auth, set } = context;

    try {
      await this.service.revertAllPasses(auth);
      set.status = 200;
      return { status: "success", data: null };
    } catch (error: any) {
      if (error.message.includes("profile could not be found")) {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { status: "error", message: error.message };
    }
  }
}
