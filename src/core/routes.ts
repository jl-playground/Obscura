import type { Elysia } from "elysia";
import { UserRouter } from "@/app/modules/user/user.route";
import { AuthRouter } from "@/app/modules/auth/auth.route";

export class AppRouter {
  private app: Elysia;
  private authRouter: AuthRouter;
  private userRouter: UserRouter;


  /**
   * Initializes the main AppRouter with the Elysia app instance.
   * @param app The main Elysia app.
   */
  constructor(app: Elysia) {
    this.app = app;
    this.authRouter = new AuthRouter(app);
    this.userRouter = new UserRouter(app);
  }

  /**
   * Registers all module routes and global routes.
   * This is the single entry point for application routing.
   * @returns The Elysia app instance with all routes registered.
   */
  public registerAll (): Elysia {
    this.authRouter.register();
    this.userRouter.register();
    this.registerGlobalRoutes();
    return this.app;
  }

  /**
   * A private method for registering global, non-module routes.
   */
  private registerGlobalRoutes (): void {
    this.app.get("/health", ({ set }) => {
      set.status = 200;
      return {
        status: "ok",
        uptime: process.uptime().toFixed(2) + "s",
      };
    });
  }
}