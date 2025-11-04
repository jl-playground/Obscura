import type { RevealVoteDto, CreateConnectionDto } from "./connection.dto";
import type { AuthPayload } from "@/app/modules/auth/auth.dto";
import type { Context } from "elysia";

export type AuthContext = { auth: AuthPayload; set: Context["set"] };

export type CreateContext = AuthContext & {
  body: CreateConnectionDto;
};

export type VoteContext = AuthContext & {
  params: { id: string };
  body: RevealVoteDto;
};
