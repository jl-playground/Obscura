import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import type { User } from "./user.entity";
import type { Message } from "./message.entity";
import type { Room } from "./room.entity";

export enum ConnectionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  REVEAL_READY = "reveal_ready",
  REVEALED = "revealed",
  PASSED = "passed",
}

@Entity("connection")
@Index(["user_a_id", "user_b_id"], { unique: true })
export class Connection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  user_a_id: string;

  @ManyToOne("user", (user: User) => user.connections_a)
  @JoinColumn({ name: "user_a_id" })
  user_a: User;

  @Column({ type: "uuid" })
  user_b_id: string;

  @ManyToOne("user", (user: User) => user.connections_b)
  @JoinColumn({ name: "user_b_id" })
  user_b: User;

  @Column({
    type: "enum",
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING,
  })
  status: ConnectionStatus;

  @Column({ type: "int", default: 0 })
  message_count: number;

  //TODO: remove this bs
  @Column({ type: "boolean", nullable: true })
  user_a_reveal_vote: boolean | null;

  //TODO: remove this bs
  @Column({ type: "boolean", nullable: true })
  user_b_reveal_vote: boolean | null;

  @CreateDateColumn()
  created_at: Date;

  // --- NEW RELATION ---
  @OneToOne("room", (room: Room) => room.connection)
  room: Room;

  @OneToMany("message", (message: Message) => message.connection)
  messages: Message[];
}
