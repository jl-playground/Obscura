import { AuthPayload } from './room.dto';
import RoomRepository from './room.repository';

export class RoomService {
  private roomRepository = new RoomRepository();

  public async list(auth: AuthPayload) {
    const { userId } = auth;
    console.log('RoomService.list() called by user:', userId);

    const rooms = await this.roomRepository.findByUserId(userId);

    console.log('Fetched rooms for user:', rooms);

    return {
      status: 'success',
      data: {
        currentUserId: userId,
        allRooms: rooms.map((room) => ({
          id: room.id,
          name:
            room.connection.user_a_id === userId
              ? room.connection.userB?.profile?.user?.email || room.connection.userB?.email
              : room.connection.userA?.profile?.user?.email || room.connection.userA?.email,
          lastMessage: room.messages?.[room.messages.length - 1] || null,
          unreadCount: 0, // you can later calculate unread messages here
        })),
      },
    };
  }

  public async getRoomMessages(auth: AuthPayload, roomId: string, body: any) {
    const { userId } = auth;
    console.log(`RoomService.getRoomMessages() called by user: ${userId} for room: ${roomId}`);

    const room = await this.roomRepository.findByIdWithMessages(roomId, userId);

    if (!room) {
      console.log(`Room not found or access denied for user: ${userId}`);
      throw new Error('Room not found or access denied');
    }

    console.log(`Fetched messages for room: ${roomId} by user: ${userId}`, room.messages);

    return {
      status: 'success',
      data: {
        roomId: room.id,
        messages: room.messages,
      },
    };
  }
}

export const roomService = new RoomService();
