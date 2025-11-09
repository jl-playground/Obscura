import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import type { Connection } from "./connection.entity";
import type { Message } from "./message.entity";

@Entity("room")
export class Room {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", unique: true })
  room_code: string;

  @OneToOne("connection", (connection: Connection) => connection.room, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "connection_id" })
  connection: Connection;

  @Column({ type: "uuid", unique: true })
  connection_id: string;

  // Relation to messages
  @OneToMany("message", (message: Message) => message.room)
  messages: Message[];

  @CreateDateColumn()
  created_at: Date;
}
