import { Elysia } from "elysia";

export class ErrorHandlerMiddleware {
  private app: Elysia;

  /**
   * Initializes the ErrorHandlerMiddleware with the main Elysia app.
   * @param app The main Elysia app instance.
   */
  constructor(app: Elysia) {
    this.app = app;
    console.log("Registering error handler middleware");
  }

  /**
   * Registers the global error handler.
   */
  public register(): void {
    this.app.onError(({ code, error, set, path }) => {
      console.error(`Error occurred on path: ${path}`);
      console.error(`Error code: ${code}`);
      console.error(`Error message: ${error}`);
    });
  }
}

// singelotie pattern can be applied if needed to ensure only one instance of the middleware exists
