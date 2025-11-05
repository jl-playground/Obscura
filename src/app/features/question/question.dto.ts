import { t } from "elysia";

// This is the validation schema for submitting an answer
export const SubmitAnswerSchema = t.Object({
  questionId: t.String({ format: "uuid" }),
  answerValue: t.String({ minLength: 1 }), // e.g., "4" or "option_b"
});

export type SubmitAnswerDto = typeof SubmitAnswerSchema.static;
