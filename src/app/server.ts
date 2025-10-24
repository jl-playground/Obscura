import { Elysia } from "elysia";
import { errorHandler } from "@/app/middlewares/errorHandler";
import { registerRoutes } from "@/app/routes";

const app = new Elysia();

errorHandler(app); // ✅ register error handler
registerRoutes(app); // ✅ register all routes

app.get("/", () => "Server running ✅");

app.listen(Number(process.env.PORT) || 3000);
console.log(
  `🚀 Server running on http://localhost:${process.env.PORT || 3000}`,
);
