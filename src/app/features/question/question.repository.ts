import { dataSource } from "@/core/db/dataSource";
import { Question } from "@/core/db/entities/question.entity";

export const QuestionRepository = dataSource.getRepository(Question).extend({
  /**
   * Fetches a set of random questions for a user to answer.
   * @param limit - The number of questions to fetch.
   * @returns An array of Question entities.
   */
  getRandomQuestions (limit: number) {
    return this.createQueryBuilder("question")
      .orderBy("RANDOM()") // Use RANDOM() for simplicity in Postgres
      .limit(limit)
      .getMany();
  },
});
