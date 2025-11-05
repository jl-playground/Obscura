import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import type { User } from "./user.entity";

@Entity("daily_batch")
export class DailyBatch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  user_id: string;

  @Column({ type: "simple-array" })
  matched_profile_ids: string[];

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne("user", (user: User) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
