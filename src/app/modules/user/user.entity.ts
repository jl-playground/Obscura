import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany
} from "typeorm";
import type { Profile } from "@/app/modules/profile/profile.entity";
import type { Connection } from "@/app/modules/connection/connection.entity";
import type { Message } from "@/app/modules/chat/message.entity";

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
