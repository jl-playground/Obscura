import { userService } from "./user.service";

// Define context types for handlers
type CreateContext = { body: unknown };

/**
 * Handles incoming HTTP requests for the /users routes.
 * Delegates business logic to the UserService.
 */
export class UserController {
  // Uses the imported singleton service
  private userService = userService;

  /**
   * Handles GET /users
   */
  public async list () {
    return this.userService.list();
  }

  /**
   * Handles POST /users
   */
  public async create ({ body }: CreateContext) {
    return this.userService.create(body);
  }

  /**
   * Handles GET /users/test-error
   */
  public async testError () {
    throw new Error("This is a test error!");
  }
}