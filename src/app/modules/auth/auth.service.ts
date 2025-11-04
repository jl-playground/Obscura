import { dataSource } from "@/core/db/dataSource";
import { UserRepository } from "@/app/modules/user/user.repository";
import { ProfileRepository } from "@/app/modules/profile/profile.repository";
import { User } from "@/app/modules/user/user.entity";
import type { Profile } from "@/app/modules/profile/profile.entity";
import { AuthPayload, LoginDto, RegisterDto } from "./auth.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

// --- Data Transfer Objects (DTOs) ---


export class AuthService {
  // Get our custom repositories
  private userRepository = UserRepository;
  private profileRepository = ProfileRepository;

  /**
   * Registers a new user and creates their associated profile.
   * This is the core "Sign Up" logic for Obscura.
   */
  public async register (dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 3. Create the User entity
    const newUser = this.userRepository.create({
      email: dto.email,
      password_hash: passwordHash,
    });
    const savedUser = await this.userRepository.save(newUser);

    // 4. Create the associated Profile entity
    const newProfile = await this.profileRepository.createEmptyProfileForUser(savedUser);

    // 5. Generate and return a token
    return this.generateAuthToken(savedUser, newProfile);
  }

  /**
   * Logs in an existing user and returns a JWT.
   */
  public async login (dto: LoginDto) {
    // 1. Find the user by email
    const user = await this.userRepository.findByEmailWithProfile(dto.email);
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    // 3. Generate and return a token
    if (!user.profile) {
      throw new Error("Login failed: User has no associated profile.");
    }

    return this.generateAuthToken(user, user.profile);
  }

  /**
   * Generates a signed JSON Web Token (JWT) for an authenticated user.
   */
  private generateAuthToken (user: User, profile: Profile) {
    const payload: AuthPayload = {
      userId: user.id,
      profileId: profile.id,
    };

    // This MUST be moved to .env
    const JWT_SECRET = process.env.JWT_SECRET || "OBSCURA_DEV_SECRET_KEY";
    const expiresIn = "7d";

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        profileId: profile.id,
      },
    };
  }
}