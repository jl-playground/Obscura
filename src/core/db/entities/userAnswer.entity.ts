import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import type { User } from "@/core/db/entities/user.entity";
import type { Question } from "@/core/db/entities/question.entity";

@Entity("user_answer")
@Index(["user_id", "question_id"], { unique: true })
export class UserAnswer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  user_id: string;

  @Column({ type: "uuid" })
  question_id: string;

  @Column({ type: "varchar" })
  answer_value: string;

  @ManyToOne("user", (user: User) => user.id)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne("question", (question: Question) => question.id)
  @JoinColumn({ name: "question_id" })
  question: Question;
}
