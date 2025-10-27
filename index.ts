import "reflect-metadata";
import "dotenv/config";
import "@/app/server";
import { initializeDataSource } from "./src/core/db/dataSource";

initializeDataSource();
