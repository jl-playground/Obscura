import { dataSource } from "@/core/db/dataSource";
import { Room } from "@/core/db/entities/room.entity";

// This is a TypeORM custom repository.
// We extend the base Repository to add our own custom query methods.

export const RoomRepository = dataSource.getRepository(Room).extend({});
