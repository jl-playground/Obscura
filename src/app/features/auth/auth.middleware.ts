import { Elysia } from "elysia";
import * as jwt from "jsonwebtoken";
import type { AuthPayload } from "@/app/features/auth/auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "OBSCURA_DEV_SECRET_KEY";

/**
 * Elysia middleware plugin to protect routes.
 * It verifies a JWT Bearer token and attaches the 'auth' payload
 * to the request context.
 */
export const authMiddleware = new Elysia({ name: "auth.middleware" })
  .derive(async ({ headers, set }) => {
    const authHeader = headers.authorization;
    console.log('\x1b[33m%s\x1b[0m', 'authHeader --------------------', authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error("No authorization token provided.");
    }
    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
      return {
        auth: payload,
      };
    } catch (error) {
      set.status = 401;
      throw new Error("Invalid or expired token.");
    }
  });