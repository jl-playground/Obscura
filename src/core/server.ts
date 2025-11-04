import { Elysia, t } from "elysia";
import { ErrorHandlerMiddleware } from "@/app/middlewares/errorHandler";
import { AppRouter } from "@/core/routes";
import { SocketHandler } from "@/app/modules/chat/chat.socket";
import { dataSource } from "@/core/db/dataSource"; // <-- 2. MUST import dataSource

// --- 3. Initialize Database FIRST ---
try {
  await dataSource.initialize();
  console.log("Data Source has been initialized!");
} catch (err) {
  console.error("Error during Data Source initialization:", err);
  process.exit(1); // Exit if DB fails
}

// --- 4. Create and Configure App ---
const app = new Elysia();

// 5. MUST register websocket plugin FIRST

// 6. Register all middleware and routes BEFORE listen()
const errorHandler = new ErrorHandlerMiddleware(app);
const router = new AppRouter(app);
const socketHandler = new SocketHandler();

errorHandler.register();
router.registerAll(); // This registers /auth, /users, /profile, /chat (REST)

app.get("/", () => "Server running ✅");

// --- 7. Register the WebSocket handler BEFORE listen() ---
// It runs on the SAME port as your HTTP server.
app
  .ws("/ws/chat", {
    open: (ws) => socketHandler.open(ws),
    message: (ws, message) => socketHandler.message(ws, message),
    close: (ws) => socketHandler.close(ws),
  })
  .listen(Number(process.env.SOCKET_PORT) || 3000);

app.listen(Number(process.env.PORT) || 3000);

console.log(
  `🚀 Server running on http://localhost:${process.env.PORT || 3000}`,
);
