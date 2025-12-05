import { AuthContext } from "../connection/connection.types";
import { roomService } from "./room.service";
// Define context types for handlers
type CreateContext = { body: unknown; params: { [key: string]: string } }; // Context for handlers with body and params
type BaseContext = { [key: string]: any }; // Base context for simple handlers

/**
 * Handles incoming HTTP requests for the /users routes.
 * Delegates business logic to the UserService.
 */
export class RoomController {
  private roomService = roomService;

  /**
   * Handles GET /users
   */
  // --- FIX IS HERE ---
  public async list(context: AuthContext) {
    const { auth } = context;
    return this.roomService.list(auth);
  }
  /**   * Handles GET /users/:userId
   */
  public async getRoomMessages(context: AuthContext & CreateContext) {
    const { auth, body } = context;
    console.log(
      "RoomController.getRoomMessages() called with context:",
      context,
    );

    const roomId = context.params.roomId as string;
    return this.roomService.getRoomMessages(auth, roomId, body);
  }
}
