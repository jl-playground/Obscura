import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateUserAnswerTable1762365980770 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the 'user_answer' table
    await queryRunner.createTable(
      new Table({
        name: "user_answer",
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
            name: "question_id",
            type: "uuid",
          },
          {
            name: "answer_value",
            type: "varchar",
          },
        ],
      }),
    );

    // Add unique index (user_id + question_id)
    await queryRunner.createIndex(
      "user_answer",
      new TableIndex({
        name: "IDX_USER_QUESTION_UNIQUE",
        columnNames: ["user_id", "question_id"],
        isUnique: true,
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKeys("user_answer", [
      new TableForeignKey({
        name: "FK_user_answer_user",
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_user_answer_question",
        columnNames: ["question_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "question",
        onDelete: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("user_answer");
    if (table) {
      await queryRunner.dropForeignKeys("user_answer", table.foreignKeys);
    }
    await queryRunner.dropIndex("user_answer", "IDX_USER_QUESTION_UNIQUE");
    await queryRunner.dropTable("user_answer");
  }
}
