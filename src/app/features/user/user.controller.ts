import { userService } from "./user.service";
// Define context types for handlers
type CreateContext = { body: unknown };
type BaseContext = { [key: string]: any }; // Base context for simple handlers

/**
 * Handles incoming HTTP requests for the /users routes.
 * Delegates business logic to the UserService.
 */
export class UserController {
  private userService = userService;

  /**
   * Handles GET /users
   */
  // --- FIX IS HERE ---
  public async list(context: BaseContext) {
    return this.userService.list();
  }

  /**
   * Handles POST /users
   */
  // --- FIX IS HERE ---
  public async create(context: CreateContext) {
    const { body } = context; // Destructure inside
    return this.userService.create(body);
  }
}

