import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateConnectionTable1761597000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "connection",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          { name: "user_a_id", type: "uuid" },
          { name: "user_b_id", type: "uuid" },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "active", "reveal_ready", "revealed", "passed"],
            default: "'pending'",
          },
          { name: "message_count", type: "int", default: 0 },
          { name: "user_a_reveal_vote", type: "boolean", isNullable: true },
          { name: "user_b_reveal_vote", type: "boolean", isNullable: true },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      "connection",
      new TableIndex({
        name: "IDX_CONNECTION_USERS",
        columnNames: ["user_a_id", "user_b_id"],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKeys("connection", [
      new TableForeignKey({
        columnNames: ["user_a_id"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["user_b_id"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("connection");
    if (table)
      await queryRunner.dropForeignKeys("connection", table.foreignKeys);
    await queryRunner.dropIndex("connection", "IDX_CONNECTION_USERS");
    await queryRunner.dropTable("connection");
  }
}
