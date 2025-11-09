import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import type { Connection } from "./connection.entity";
import type { Room } from "./room.entity";
import type { User } from "./user.entity";

export enum MessageType {
  TEXT = "text",
  VOICE = "voice",
}

@Entity("message")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  connection_id: string;

  @ManyToOne("connection", (connection: Connection) => connection.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "connection_id" })
  connection: Connection;

  // --- NEW: link directly to room for socket routing ---
  @Column({ type: "uuid" })
  room_id: string;

  @ManyToOne("room", (room: Room) => room.messages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "room_id" })
  room: Room;

  @Column({ type: "uuid" })
  sender_id: string;

  @ManyToOne("user", (user: User) => user.messages)
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @Column({ type: "text" })
  content_url: string;

  @Column({
    type: "enum",
    enum: MessageType,
    default: MessageType.TEXT,
  })
  message_type: MessageType;

  @CreateDateColumn()
  created_at: Date;
}
