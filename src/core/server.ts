import { Elysia, t } from "elysia";
import { ErrorHandlerMiddleware } from "@/app/middlewares/errorHandler";
import { AppRouter } from "@/core/routes";
import { SocketHandler } from "@/app/features/chat/chat.socket";
import S3Connection from "./s3/s3connection";

// --- Create App ---
const app = new Elysia();

// Register middleware
const errorHandler = new ErrorHandlerMiddleware(app);
const router = new AppRouter(app);
const socketHandler = new SocketHandler();
const s3 = S3Connection.instance.getBucket;

errorHandler.register();
router.registerAll();

app.get("/", () => "Server running ✅");

// --- WebSocket & Listen ---
app
  .ws("/ws/chat", {
    open: (ws) => socketHandler.open(ws),
    message: (ws, message) => socketHandler.message(ws, message),
    close: (ws) => socketHandler.close(ws),
  })
  .listen(Number(process.env.PORT) || 3000);

console.log(
  `🚀 Server running on http://localhost:${process.env.PORT || 3000}`,
);
