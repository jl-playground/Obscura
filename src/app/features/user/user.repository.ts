import { dataSource } from "@/core/db/dataSource";
import { User } from "../../../core/db/entities/user.entity"; // This is the direct entity import

// This is a TypeORM custom repository.
// We extend the base Repository to add our own custom query methods.

export const UserRepository = dataSource.getRepository(User).extend({
  /**
   * Finds a user by their email address.
   * @param email - The email to search for.
   * @returns A User entity or null.
   */
  findByEmail (email: string) {
    return this.findOne({
      where: { email: email.toLowerCase() }, // Standardize email search
    });
  },

  /**
   * Finds a user by email and automatically joins their associated profile.
   * This is optimized for the login process.
   * @param email - The email to search for.
   * @returns A User entity with the 'profile' relation loaded, or null.
   */
  findByEmailWithProfile (email: string) {
    return this.findOne({
      where: { email: email.toLowerCase() },
      relations: ["profile"], // This 'profile' string matches the relation name in User entity
    });
  },

  /**
   * Finds a user by their ID, including all their core relations
   * for a full "Get Me" profile request.
   * @param id - The UUID of the user.
   * @returns A User entity with profile, connections, etc., or null.
   */
  findUserWithAllRelations (id: string) {
    return this.findOne({
      where: { id },
      relations: ["profile", "connections_a", "connections_b"],
    });
  },
});
