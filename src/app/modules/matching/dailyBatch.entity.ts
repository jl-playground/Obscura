import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import type { User } from "../user/user.entity";

@Entity("daily_batch")
export class DailyBatch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  @Index() // We will query by this
  user_id: string;

  /**
   * The list of profile UUIDs that were matched with the user.
   * We store only the IDs for simplicity.
   */
  @Column("simple-array") // This maps to text[] in Postgres
  matched_profile_ids: string[];

  @CreateDateColumn()
  created_at: Date; // We use this timestamp to check if 24h have passed

  @ManyToOne("user", (user: User) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
