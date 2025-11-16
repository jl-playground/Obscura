import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey, TableIndex } from "typeorm";

export class AddDailyBatchTable1762366660757 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "daily_batch",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "matched_profile_ids",
            type: "jsonb",
            default: "'[]'",
          },
          {
            name: "passed_profile_ids",
            type: "jsonb",
            default: "'[]'",
          },
          {
            name: "connected_profile_ids",
            type: "jsonb",
            default: "'[]'",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    // Add index for faster lookups
    await queryRunner.createIndex(
      "daily_batch",
      new TableIndex({
        name: "IDX_DAILY_BATCH_USER",
        columnNames: ["user_id"],
      }),
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      "daily_batch",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("daily_batch", "FK_daily_batch_user");
    await queryRunner.dropIndex("daily_batch", "IDX_DAILY_BATCH_USER");
    await queryRunner.dropTable("daily_batch");
  }
}
