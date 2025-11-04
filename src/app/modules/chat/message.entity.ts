import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import type { Connection } from "@/app/modules/connection/connection.entity";
import type { User } from "@/app/modules/user/user.entity";

export enum MessageType {
  TEXT = "text",
  VOICE = "voice"
}

@Entity("message")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  connection_id: string;

  @ManyToOne('connection', (connection: Connection) => connection.messages)
  @JoinColumn({ name: "connection_id" })
  connection: Connection;

  @Column("uuid")
  sender_id: string;

  @ManyToOne('user', (user: User) => user.messages)
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @Column("text")
  content_url: string;

  @Column({
    type: "enum",
    enum: MessageType,
    default: MessageType.TEXT
  })
  message_type: MessageType;

  @CreateDateColumn()
  created_at: Date;
}