import { AuthPayload } from "./room.dto";
import { RoomRepository } from "./room.repository";

export class RoomService {
  private roomRepository = RoomRepository;

  public async list(auth: AuthPayload) {
    const { userId } = auth;
    console.log("RoomService.list() called by user:", userId);

    const rooms = await this.roomRepository
      .createQueryBuilder("room")
      .leftJoinAndSelect("room.connection", "connection")
      .where("connection.user_a_id = :userId", { userId })
      .orWhere("connection.user_b_id = :userId", { userId })
      .leftJoinAndSelect("connection.user_a", "user_a")
      .leftJoinAndSelect("connection.user_b", "user_b")
      .leftJoinAndSelect("room.messages", "messages")
      .orderBy("room.created_at", "DESC")
      .getMany();

    console.log("Fetched rooms for user:", rooms);

    return {
      status: "success",
      data: {
        currentUserId: userId,
        allRooms: rooms.map((room) => ({
          id: room.id,
          name:
            room.connection.user_a_id === userId
              ? room.connection.user_b?.profile?.user?.email ||
                room.connection.user_b?.email
              : room.connection.user_a?.profile?.user?.email ||
                room.connection.user_a?.email,
          lastMessage: room.messages?.[room.messages.length - 1] || null,
          unreadCount: 0, // you can later calculate unread messages here
        })),
      },
    };
  }
}

export const roomService = new RoomService();
