import "reflect-metadata";
import "dotenv/config";
import "@/core/server";
import { initializeDataSource } from "@/core/db/dataSource";

initializeDataSource();
