import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany
} from "typeorm";
import type { Profile } from "@/core/db/entities/profile.entity";
import type { Connection } from "@/core/db/entities/connection.entity";
import type { Message } from "@/core/db/entities/message.entity";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('profile', (profile: Profile) => profile.user)
  profile: Profile;

  @OneToMany('connection', (connection: Connection) => connection.user_a)
  connections_a: Connection[];

  @OneToMany('connection', (connection: Connection) => connection.user_b)
  connections_b: Connection[];

  @OneToMany('message', (message: Message) => message.sender)
  messages: Message[];
}
