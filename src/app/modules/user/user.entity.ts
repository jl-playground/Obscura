import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

/**
 * Defines the database table for Users.
 * The @Entity() decorator marks this class as a TypeORM entity.
 * We pass { name: 'users' } to specify the actual table name in the database.
 */
@Entity({ name: "users" })
export class User {
  /**
   * @PrimaryGeneratedColumn() creates a primary key column that
   * auto-increments (e.g., 1, 2, 3...).
   * The '!' tells TypeScript that this property will be initialized
   * by TypeORM, not in the constructor.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * @Column() marks this as a regular data column.
   * We can pass options like 'unique: true' to add a unique constraint.
   */
  @Column({ unique: true })
  email!: string;

  /**
   * A column for the user's hashed password.
   * NEVER store passwords in plain text.
   * We can make the column non-selectable by default for security.
   */
  @Column({ select: false })
  passwordHash!: string;

  @Column({ name: "first_name", nullable: true })
  firstName: string;

  @Column({ name: "last_name", nullable: true })
  lastName: string;

  /**
   * @CreateDateColumn() automatically sets the column to the
   * current date and time when the entity is first inserted.
   */
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  /**
   * @UpdateDateColumn() automatically updates the column's
   * timestamp every time the entity is saved (updated).
   */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // --- RELATIONSHIP ---

  /**
   * @OneToMany() defines the "one" side of a one-to-many relationship.
   * 1. The first argument `() => Post` points to the related entity.
   * 2. The second argument `(post) => post.user` points to the
   * 'user' property on the Post entity that "owns" this relationship.
   *
   * This 'posts' property will be an array of Post objects.
   * It does NOT exist in the 'users' database table.
   */
  // @OneToMany(() => Post, (post) => post.user)
  // posts: Post[];
}
