import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Defines the type of question, which dictates how answers are scored.
 * - scale_1_5: A numerical range (e.g., "How spontaneous? 1...5")
 * - multiple_choice: A discrete set of options (e.g., "Ideal weekend?")
 */
export enum QuestionType {
  SCALE_1_5 = "scale_1_5",
  MULTIPLE_CHOICE = "multiple_choice",
}

@Entity("question")
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  text: string; // e.g., "How spontaneous are you?"

  @Column({
    type: "enum",
    enum: QuestionType,
  })
  type: QuestionType;

  /**
   * Stores options for MULTIPLE_CHOICE.
   * Example:
   * [
   * { "key": "option_a", "value": "A quiet night in" },
   * { "key": "option_b", "value": "A big night out" }
   * ]
   */
  @Column("simple-json", { nullable: true })
  options: { key: string; value: string }[] | null;
}
