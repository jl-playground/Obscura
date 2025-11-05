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

  @Column("uuid")
  user_id: string;

  @OneToOne("user", (user: User) => user.profile)
  @JoinColumn({ name: "user_id" })
  user: User;

  // --- FIX IS HERE ---
  @Column("text", { default: "" })
  bio: string;

  // --- FIX IS HERE ---
  @Column("simple-array", { default: [] })
  interests: string[];

  // --- FIX IS HERE ---
  @Column("simple-array", { default: [] })
  photo_urls: string[];

  @Column()
  silhouette_url: string;
}
