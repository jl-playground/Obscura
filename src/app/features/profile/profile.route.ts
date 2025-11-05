import type { Elysia } from "elysia";
import { ProfileController } from "./profile.controller";
import { UpdateProfileSchema } from "./profile.dto";
import { authMiddleware } from "../auth/auth.middleware";
import type { GetByIdContext } from "./profile.types";

/**
 * Manages the registration of all profile-related routes.
 */
export class ProfileRoutes {
  private app: Elysia;
  private controller: ProfileController;

  constructor(app: Elysia) {
    this.app = app;
    this.controller = new ProfileController();
    console.log("Registering profile routes");
  }

  public register (): void {
    this.app.group("/profile", (group) =>
      group
        .use(authMiddleware)
        .get(
          "/me",
          (context) => this.controller.getMyProfile(context as any)
        )
        .patch(
          "/me",
          (context) => this.controller.updateMyProfile(context as any),
          { body: UpdateProfileSchema }
        )
        .get(
          "/:id",
          (context: any) => this.controller.getProfileById(context as GetByIdContext)
        )
        .get(
          "/test",
          () => "Profile route works!"
        )
    );
  }
}
