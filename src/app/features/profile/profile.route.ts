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

  public register(): void {
    this.app.group("/profile", (group) =>
      group
        // Protected sub-routes
        .guard({ beforeHandle: authMiddleware }, (guarded) =>
          guarded
            .get("/me", (ctx) => this.controller.getMyProfile(ctx as any))
            .patch(
              "/me",
              (ctx) => this.controller.updateMyProfile(ctx as any),
              { body: UpdateProfileSchema },
            ),
        )

        // Public routes
        .get("/:id", (ctx) => this.controller.getProfileById(ctx as any))
        .get("/test", () => "Profile route works!"),
    );
  }
}
