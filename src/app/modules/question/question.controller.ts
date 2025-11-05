import { QuestionService } from "./question.service";
import type { SubmitAnswerDto } from "./question.dto";
import type { AuthPayload } from "@/app/modules/auth/auth.dto";
import type { Context } from "elysia";

// --- Context Types ---
type AuthContext = { auth: AuthPayload; set: Context["set"] };
type SubmitAnswerContext = AuthContext & { body: SubmitAnswerDto };

export class QuestionController {
  private service = new QuestionService();

  /**
   * Handles GET /questions/daily
   * Fetches a batch of unanswered questions for the user.
   */
  public async getDailyQuestions(context: AuthContext) {
    const { auth, set } = context;
    try {
      const result = await this.service.getDailyQuestions(auth);
      set.status = 200; // OK
      return { status: "success", data: result };
    } catch (error: any) {
      set.status = 500;
      return { status: "error", message: error.message };
    }
  }

  /**
   * Handles POST /questions/answer
   * Submits a user's answer to a question.
   */
  public async submitAnswer(context: SubmitAnswerContext) {
    const { auth, body, set } = context;
    try {
      const result = await this.service.submitAnswer(auth, body);
      set.status = 201; // Created
      return { status: "success", data: result };
    } catch (error: any) {
      if (error.message.includes("not found")) {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { status: "error", message: error.message };
    }
  }
}
