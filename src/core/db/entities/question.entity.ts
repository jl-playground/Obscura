import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum QuestionType {
  SCALE_1_5 = "scale_1_5",
  MULTIPLE_CHOICE = "multiple_choice",
}

@Entity("question")
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  text: string;

  @Column({
    type: "enum",
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: "simple-json", nullable: true })
  options: { key: string; value: string }[] | null;
}
