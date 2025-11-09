import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateQuestionTable1762365980769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            type: "json",
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("question");
  }
}
