import type { MigrationInterface, QueryRunner } from "typeorm";

import { Table, TableForeignKey, TableIndex } from "typeorm";

export class AddMatchingTable1762365980769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create 'question' table
    await queryRunner.createTable(
      new Table({
        name: "question",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "text",
            type: "text",
          },
          {
            name: "type",
            type: "enum",
            enum: ["scale_1_5", "multiple_choice"],
          },
          {
            name: "options",
            type: "json", // 'simple-json' maps to 'json' in postgres
            isNullable: true,
          },
        ],
      }),
    );

    // 2. Create 'user_answer' table
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

    // 3. Add unique index to 'user_answer'
    await queryRunner.createIndex(
      "user_answer",
      new TableIndex({
        name: "IDX_USER_QUESTION_UNIQUE",
        columnNames: ["user_id", "question_id"],
        isUnique: true,
      }),
    );

    // 4. Add foreign keys
    await queryRunner.createForeignKey(
      "user_answer",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "user_answer",
      new TableForeignKey({
        columnNames: ["question_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "question",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order
    await queryRunner.dropForeignKey("user_answer", "FK_user_answer_question");
    await queryRunner.dropForeignKey("user_answer", "FK_user_answer_user");
    await queryRunner.dropIndex("user_answer", "IDX_USER_QUESTION_UNIQUE");
    await queryRunner.dropTable("user_answer");
    await queryRunner.dropTable("question");
  }
}
