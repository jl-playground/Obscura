// src/db/data-source.ts
import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false, // Always false for production
  logging: true,

  entities: ["src/core/db/entities/*.ts"],
  migrations: ["src/core/db/migrations/*.ts"],
});

// Initialize the data source
export const initializeDataSource = () => {
  if (!dataSource.isInitialized) {
    dataSource
      .initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization:", err);
      });
  }
};
