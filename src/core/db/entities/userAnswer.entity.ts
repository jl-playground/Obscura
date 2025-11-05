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
@Index(["user_id", "question_id"], { unique: true }) // A user can only answer a question once
export class UserAnswer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  user_id: string;

  @Column("uuid")
  question_id: string;

  @Column("varchar")
  answer_value: string; // e.g., "4" (for scale) or "option_b" (for choice)

  @ManyToOne("user", (user: User) => user.id)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne("question", (question: Question) => question.id)
  @JoinColumn({ name: "question_id" })
  question: Question;
}
