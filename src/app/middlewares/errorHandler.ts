// src/app/middlewares/errorHandler.ts
import type { Elysia } from "elysia";

export const errorHandler = (app: Elysia) => {
  app.onError(({ error, code }) => {
    console.error(`[${code}]`, error?.message || error);

    return new Response(
      JSON.stringify({
        success: false,
        code,
        message: error?.message || "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  return app; // very important — must return app
};
