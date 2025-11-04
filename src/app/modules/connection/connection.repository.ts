import { dataSource } from "@/core/db/dataSource";
import { Connection } from "./connection.entity";

export const ConnectionRepository = dataSource
  .getRepository(Connection)
  .extend({
    /**
     * Finds an existing connection between two user IDs,
     * regardless of which user is user_a or user_b.
     */
    findConnectionBetweenUsers(userIdA: string, userIdB: string) {
      return this.createQueryBuilder("connection")
        .where(
          "(connection.user_a_id = :userIdA AND connection.user_b_id = :userIdB)",
          { userIdA, userIdB },
        )
        .orWhere(
          "(connection.user_a_id = :userIdB AND connection.user_b_id = :userIdA)",
          { userIdA, userIdB },
        )
        .getOne();
    },
  });
