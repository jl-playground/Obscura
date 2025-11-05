import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateInitialSchema1761597152693 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    // 1. Enable UUID generation extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 2. Create 'users' table
    await queryRunner.createTable(
      new Table({
        name: "user",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "password_hash",
            type: "varchar",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    // 3. Create 'profiles' table
    await queryRunner.createTable(
      new Table({
        name: "profile",
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
            isUnique: true,
          },
          {
            name: "bio",
            type: "text",
            default: "''", // <-- ADDED: SQL empty string literal
          },
          {
            name: "interests",
            type: "text[]",
            default: "'{}'", // <-- ADDED: SQL empty array literal
          },
          {
            name: "photo_urls",
            type: "text[]",
            default: "'{}'", // <-- ADDED: SQL empty array literal
          },
          {
            name: "silhouette_url",
            type: "varchar",
          },
        ],
      }),
    ); // 4. Create 'connections' table
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
          {
            name: "user_a_id",
            type: "uuid",
          },
          {
            name: "user_b_id",
            type: "uuid",
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "active", "reveal_ready", "revealed", "passed"],
            default: "'pending'",
          },
          {
            name: "message_count",
            type: "int",
            default: 0,
          },
          {
            name: "user_a_reveal_vote",
            type: "boolean",
            isNullable: true,
          },
          {
            name: "user_b_reveal_vote",
            type: "boolean",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    // Add unique index for connections
    await queryRunner.createIndex(
      "connection",
      new TableIndex({
        name: "IDX_CONNECTION_USERS",
        columnNames: ["user_a_id", "user_b_id"],
        isUnique: true,
      }),
    );

    // 5. Create 'messages' table
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
          {
            name: "connection_id",
            type: "uuid",
          },
          {
            name: "sender_id",
            type: "uuid",
          },
          {
            name: "content_url",
            type: "text",
          },
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

    // 6. Create all Foreign Keys
    await queryRunner.createForeignKey(
      "profile",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      }),
    );
    await queryRunner.createForeignKey(
      "connection",
      new TableForeignKey({
        columnNames: ["user_a_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      }),
    );
    await queryRunner.createForeignKey(
      "connection",
      new TableForeignKey({
        columnNames: ["user_b_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      }),
    );
    await queryRunner.createForeignKey(
      "message",
      new TableForeignKey({
        columnNames: ["connection_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "connection",
        onDelete: "CASCADE",
      }),
    );
    await queryRunner.createForeignKey(
      "message",
      new TableForeignKey({
        columnNames: ["sender_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order
    const tables = ["message", "connection", "profile", "user"];
    for (const table of tables) {
      const tableRef = await queryRunner.getTable(table);
      if (tableRef) {
        // Drop all foreign keys first
        await queryRunner.dropForeignKeys(table, tableRef.foreignKeys);
      }
    }

    // Drop indices
    await queryRunner.dropIndex("connection", "IDX_CONNECTION_USERS");

    // Drop tables
    await queryRunner.dropTable("message");
    await queryRunner.dropTable("connection");
    await queryRunner.dropTable("profile");
    await queryRunner.dropTable("user");

    // Drop the extension
    await queryRunner.query('DROP EXTENSION IF EXISTS "uuid-ossp";');
  }
}

