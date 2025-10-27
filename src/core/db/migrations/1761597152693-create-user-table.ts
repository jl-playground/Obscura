import type { MigrationInterface } from "typeorm";
import { Table, TableForeignKey } from "typeorm";
import type { QueryRunner } from "typeorm";

export class CreateUserTable1761597152693 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the "users" table
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "serial", // "serial" is a PostgreSQL-specific auto-incrementing integer
            isPrimary: true,
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "passwordHash",
            type: "varchar",
          },
          {
            name: "first_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "last_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true, // true = create table if it doesn't exist
    );

    // 2. Create the "posts" table
    await queryRunner.createTable(
      new Table({
        name: "posts",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "content",
            type: "text",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "user_id", // This will be the foreign key column
            type: "int",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 3. Create the foreign key constraint
    // This links the "posts.user_id" column to the "users.id" column
    await queryRunner.createForeignKey(
      "posts", // The table to add the constraint to
      new TableForeignKey({
        columnNames: ["user_id"], // The column in the "posts" table
        referencedColumnNames: ["id"], // The column it references in the "users" table
        referencedTableName: "users", // The table it references
        onDelete: "CASCADE", // If a user is deleted, delete all their posts
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // To reverse the migration, we drop everything in reverse order

    // 1. Drop the foreign key
    // We must find the constraint by its name. TypeORM usually follows this convention:
    // "FK_{columnName}_{referencedTableName}" but it's safer to find it.
    const table = await queryRunner.getTable("posts");
    const foreignKey = table!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("user_id") !== -1,
    );
    if (foreignKey) await queryRunner.dropForeignKey("posts", foreignKey);

    // 2. Drop the "posts" table
    await queryRunner.dropTable("posts");

    // 3. Drop the "users" table
    await queryRunner.dropTable("users");
  }
}
