import { dataSource } from "@/core/db/dataSource";
import { Room } from "@/core/db/entities/room.entity";

export const RoomRepository = dataSource.getRepository(Room).extend({
  findRoomBetweenUsers(userIdA: string, userIdB: string) {
    return this.createQueryBuilder("room")
      .where("(room.user_a_id = :userIdA AND room.user_b_id = :userIdB)", {
        userIdA,
        userIdB,
      })
      .orWhere("(room.user_a_id = :userIdB AND room.user_b_id = :userIdA)", {
        userIdA,
        userIdB,
      })
      .getOne();
  },
});
