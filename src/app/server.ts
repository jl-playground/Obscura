import { Elysia } from "elysia";
import { errorHandler } from "@/app/middlewares/errorHandler";
import { AppRouter } from "@/app/routes";

const app = new Elysia();

errorHandler(app);
const router = new AppRouter(app);
router.registerAll();

app.get("/", () => "Server running ✅");

app.listen(Number(process.env.PORT) || 3000);
console.log(
  `🚀 Server running on http://localhost:${process.env.PORT || 3000}`,
);
