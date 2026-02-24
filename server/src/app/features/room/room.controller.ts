import { roomService } from './room.service';
// Define context types for handlers

import type { AuthPayload } from './room.dto';

interface CreateContext {
  body: unknown;
  params: Record<string, string>;
}

type BaseContext = Record<string, unknown>;
type AuthContext = BaseContext & { auth: AuthPayload }; // Context for handlers that require authentication

/**
 * Handles incoming HTTP requests for the /users routes.
 * Delegates business logic to the UserService.
 */
export default class RoomController {
  private roomService = roomService;

  /**
   * Handles GET /users
   */
  public async list(context: AuthContext): Promise<unknown> {
    const { auth } = context;
    return this.roomService.list(auth);
  }

  /**   * Handles GET /users/:userId
   */
  public async getRoomMessages(context: AuthContext & CreateContext): Promise<unknown> {
    const { auth, body } = context;
    console.log('RoomController.getRoomMessages() called with context:', context);

    const { roomId } = context.params;
    return this.roomService.getRoomMessages(auth, roomId, body);
  }
}
