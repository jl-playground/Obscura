import type { Elysia } from "elysia";
import { QuestionController } from "./question.controller";
import { SubmitAnswerSchema } from "./question.dto";
import { authMiddleware } from "../auth/auth.middleware";

/**
 * Manages the registration of all question-related routes.
 */
export class QuestionRoutes {
  private app: Elysia;
  private controller: QuestionController;

  constructor(app: Elysia) {
    this.app = app;
    this.controller = new QuestionController();
    console.log("Registering question routes");
  }

  public register(): void {
    this.app.group("/questions", (group) =>
      group.guard({ beforeHandle: authMiddleware }, (guarded) =>
        guarded
          // Get the daily batch of questions
          .get("/daily", (ctx) => this.controller.getDailyQuestions(ctx as any))

          // Submit an answer
          .post("/answer", (ctx) => this.controller.submitAnswer(ctx as any), {
            body: SubmitAnswerSchema,
          }),
      ),
    );
  }
}
