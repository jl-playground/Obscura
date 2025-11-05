import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "@/core/db/entities/user.entity";

@Entity("profile")
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  user_id: string;

  @OneToOne("user", (user: User) => user.profile)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "text", default: "" })
  bio: string;

  @Column({ type: "simple-array", default: [] })
  interests: string[];

  @Column({ type: "simple-array", default: [] })
  photo_urls: string[];

  @Column({ type: "varchar" })
  silhouette_url: string;
}
