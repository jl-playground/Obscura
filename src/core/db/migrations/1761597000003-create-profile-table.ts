
import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey } from "typeorm";

export class CreateProfileTable1761597000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "profile",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
          { name: "user_id", type: "uuid", isUnique: true },
          { name: "bio", type: "text", default: "''" },
          { name: "interests", type: "text[]", default: "'{}'" },
          { name: "photo_urls", type: "text[]", default: "'{}'" },
          { name: "silhouette_url", type: "varchar" },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      "profile",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("profile");
    if (table) await queryRunner.dropForeignKeys("profile", table.foreignKeys);
    await queryRunner.dropTable("profile");
  }
}

