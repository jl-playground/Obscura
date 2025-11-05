import { QuestionRepository } from "./question.repository"; // We will create this
import { AuthPayload } from "@/app/modules/auth/auth.dto";
import { SubmitAnswerDto } from "./question.dto";
import { Not, In } from "typeorm";
import { UserAnswerRepository } from "../matching/userAnswer.repository";

// How many questions to give the user at a time
const DAILY_QUESTION_LIMIT = 3;

export class QuestionService {
  private questionRepo = QuestionRepository;
  private answerRepo = UserAnswerRepository;

  /**
   * Fetches a small batch of questions for the user that
   * they have not answered yet.
   */
  public async getDailyQuestions(auth: AuthPayload) {
    const { userId } = auth;

    // 1. Find all question IDs the user has already answered
    const answeredQuestions = await this.answerRepo.find({
      where: { user_id: userId },
      select: ["question_id"],
    });
    const answeredQuestionIds = answeredQuestions.map((a) => a.question_id);

    // 2. Find new, random questions
    const questions = await this.questionRepo.find({
      where: {
        // Find questions WHERE id is NOT IN the answered list
        id: Not(In(answeredQuestionIds)),
      },
      order: {
        // This is a simple way to get random rows
        // Note: This can be slow on large tables, but fine for MVP
        id: "DESC", // Or use `RANDOM()` if your DB (Postgres) supports it well
      },
      take: DAILY_QUESTION_LIMIT,
    });

    return questions;
  }

  /**
   * Saves a user's answer to a question.
   */
  public async submitAnswer(auth: AuthPayload, dto: SubmitAnswerDto) {
    const { userId } = auth;
    const { questionId, answerValue } = dto;

    // 1. Check if question exists
    const question = await this.questionRepo.findOneBy({ id: questionId });
    if (!question) {
      throw new Error("Question not found.");
    }

    // 2. Check if answer is valid for the question
    // (e.g., if multiple choice, is 'answerValue' a valid 'key'?)
    // (We'll skip this complex validation for the V1 service)

    // 3. Check if user has already answered this
    const existingAnswer = await this.answerRepo.findOneBy({
      user_id: userId,
      question_id: questionId,
    });

    if (existingAnswer) {
      // User is changing their answer
      existingAnswer.answer_value = answerValue;
      return this.answerRepo.save(existingAnswer);
    } else {
      // User is answering for the first time
      const newAnswer = this.answerRepo.create({
        user_id: userId,
        question_id: questionId,
        answer_value: answerValue,
      });
      return this.answerRepo.save(newAnswer);
    }
  }
}
