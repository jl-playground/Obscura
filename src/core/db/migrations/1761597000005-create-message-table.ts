import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey } from "typeorm";

export class CreateMessageTable1761597000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "message",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          { name: "connection_id", type: "uuid" },
          { name: "room_id", type: "uuid" },
          { name: "sender_id", type: "uuid" },
          { name: "content_url", type: "text" },
          {
            name: "message_type",
            type: "enum",
            enum: ["text", "voice"],
            default: "'text'",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys("message", [
      new TableForeignKey({
        columnNames: ["connection_id"],
        referencedTableName: "connection",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["room_id"],
        referencedTableName: "room",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["sender_id"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("message");
    if (table) await queryRunner.dropForeignKeys("message", table.foreignKeys);
    await queryRunner.dropTable("message");
  }
}
