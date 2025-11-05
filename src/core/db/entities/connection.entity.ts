import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn, OneToMany } from "typeorm";
import type { User } from "./user.entity";
import type { Message } from "./message.entity";

export enum ConnectionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  REVEAL_READY = "reveal_ready",
  REVEALED = "revealed",
  PASSED = "passed"
}

@Entity("connection")
@Index(["user_a_id", "user_b_id"], { unique: true })
export class Connection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  user_a_id: string;

  // --- RELATION FIX ---
  // No explicit ': User' type annotation.
  @ManyToOne('user', (user: User) => user.connections_a)
  @JoinColumn({ name: "user_a_id" })
  user_a: User; // Type 'User' is inferred

  @Column("uuid")
  user_b_id: string;

  // --- RELATION FIX ---
  // No explicit ': User' type annotation.
  @ManyToOne('user', (user: User) => user.connections_b)
  @JoinColumn({ name: "user_b_id" })
  user_b: User; // Type 'User' is inferred

  @Column({
    type: "enum",
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING
  })
  status: ConnectionStatus;

  @Column({ default: 0 })
  message_count: number;

  @Column({ type: "boolean", nullable: true })
  user_a_reveal_vote: boolean | null;

  @Column({ type: "boolean", nullable: true })
  user_b_reveal_vote: boolean | null;

  @CreateDateColumn()
  created_at: Date;

  // Relation for messages
  @OneToMany('message', (message: Message) => message.connection)
  messages: Message[]; // Type 'Message[]' is inferred
}
