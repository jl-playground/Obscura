import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import type { User } from "@/app/modules/user/user.entity";

@Entity("profile")
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  user_id: string;

  @OneToOne('user', (user: User) => user.profile)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column("text")
  bio: string;

  @Column("simple-array")
  interests: string[];

  @Column("simple-array")
  photo_urls: string[];

  @Column()
  silhouette_url: string;
}
