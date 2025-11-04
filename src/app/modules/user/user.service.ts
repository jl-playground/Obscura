import { UserRepository } from "./user.repository";

export class UserService {
  // We assume UserRepository exists, as we built it for the auth module.
  private userRepository = UserRepository;

  /**
   * Placeholder: Fetches a list of users.
   */
  public async list () {
    console.log("UserService.list() called");
    // In a real app, this would be: return this.userRepository.find();
    return { status: "success", data: [{ id: "uuid-123", email: "test@obscura.app" }] };
  }

  /**
   * Placeholder: Creates a new user.
   * NOTE: We should reuse AuthService.register for this logic.
   */
  public async create (body: any) {
    console.log("UserService.create() called");
    // This is a placeholder. Real user creation is handled by AuthService.
    return { status: "success", data: body };
  }
}

// Export a singleton instance, as your example controller imports.
export const userService = new UserService();