import * as jwt from "jsonwebtoken";
import type { AuthPayload } from "@/app/features/auth/auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "OBSCURA_DEV_SECRET_KEY";

/**
 * A request-time middleware function, not a plugin instance.
 */
export async function authMiddleware(ctx: any) {
  const { headers, set } = ctx;
  console.log(ctx);

  const authHeader = headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    set.status = 401;
    throw new Error("No authorization token provided.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    ctx.auth = payload;
  } catch (error) {
    set.status = 401;
    throw new Error("Invalid or expired token.");
  }
}
