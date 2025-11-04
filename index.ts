import "reflect-metadata";
import "dotenv/config";
import "@/core/server";
import { initializeDataSource } from "./src/core/db/dataSource";

initializeDataSource();
