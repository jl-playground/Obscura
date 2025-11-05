import type { AuthPayload } from "../auth/auth.dto";
import type { Context } from "elysia";
import type { UpdateProfileDto } from "./profile.dto";

export type AuthContext = {
  auth: AuthPayload;
  set: Context["set"];
};

export type UpdateContext = AuthContext & {
  body: UpdateProfileDto;
};

export type GetByIdContext = AuthContext & {
  params: { id: string };
};