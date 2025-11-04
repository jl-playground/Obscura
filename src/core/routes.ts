import type { Elysia } from "elysia";
import { UserRoutes } from "@/app/modules/user/user.route";
import { AuthRoutes } from "@/app/modules/auth/auth.route";
import { ProfileRoutes } from "@/app/modules/profile/profile.route";
import { ConnectionRoutes } from "@/app/modules/connection/connection.route";
import { ChatRoutes } from "@/app/modules/chat/chat.route";

export class AppRouter {
  private app: Elysia;
  private authRoutes: AuthRoutes;
  private userRoutes: UserRoutes;
  private profileRoutes: ProfileRoutes;
  private connectionRoutes: ConnectionRoutes;
  private chatRoutes: ChatRoutes;

  /**
   * Initializes the main AppRouter with the Elysia app instance.
   * @param app The main Elysia app.
   */
  constructor(app: Elysia) {
    this.app = app;
    this.authRoutes = new AuthRoutes(app);
    this.userRoutes = new UserRoutes(app);
    this.profileRoutes = new ProfileRoutes(app);
    this.connectionRoutes = new ConnectionRoutes(app);
    this.chatRoutes = new ChatRoutes(app);
  }

  /**
   * Registers all module routes and global routes.
   * This is the single entry point for application routing.
   * @returns The Elysia app instance with all routes registered.
   */
  public registerAll(): Elysia {
    this.authRoutes.register();
    this.userRoutes.register();
    this.profileRoutes.register();
    this.connectionRoutes.register();
    this.chatRoutes.register();
    this.registerGlobalRoutes();
    return this.app;
  }

  /**
   * A private method for registering global, non-module routes.
   */
  private registerGlobalRoutes(): void {
    this.app.get("/health", ({ set }) => {
      set.status = 200;
      return {
        status: "ok",
        uptime: process.uptime().toFixed(2) + "s",
      };
    });
    this.app.get("throw", () => {
      throw new Error("This is a test error");
    });
  }
}
