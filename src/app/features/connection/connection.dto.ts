import { t } from "elysia";

// We'll use this for our AI matching, but for now,
// it allows a user to manually initiate a connection.
export const CreateConnectionSchema = t.Object({
  recipientProfileId: t.String({ format: "uuid" }),
});
export type CreateConnectionDto = typeof CreateConnectionSchema.static;

// This is the DTO for our 'Mutual Reveal' vote.
export const RevealVoteSchema = t.Object({
  vote: t.Boolean(),
});
export type RevealVoteDto = typeof RevealVoteSchema.static;
