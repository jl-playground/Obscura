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
      group
        // All question routes MUST be protected.
        .use(authMiddleware)

        // Endpoint to get a batch of questions
        .get("/daily", (context: any) =>
          this.controller.getDailyQuestions(context),
        )

        // Endpoint to submit an answer
        .post(
          "/answer",
          (context: any) => this.controller.submitAnswer(context),
          {
            body: SubmitAnswerSchema,
          },
        ),
    );
  }
}
