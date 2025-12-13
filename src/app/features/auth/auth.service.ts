import { dataSource } from "@/core/db/dataSource";
import { UserRepository } from "@/app/features/user/user.repository";
import { ProfileRepository } from "@/app/features/profile/profile.repository";
import type { User } from "@/core/db/entities/user.entity";
import type { Profile } from "@/core/db/entities/profile.entity";
import {
  AuthPayload,
  LoginDto,
  RegisterDto,
  RegisterPayload,
} from "./auth.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { EmailService } from "../email/email.service";

// --- Data Transfer Objects (DTOs) ---

export class AuthService {
  // Get our custom repositories
  private userRepository = UserRepository;
  private profileRepository = ProfileRepository;
  private emailService = new EmailService();

  /**
   * Registers a new user and creates their associated profile.
   * This is the core "Sign Up" logic for Obscura.
   */
  public async register(dto: RegisterDto) {
    // 1. Check if user already exists
    console.log(`Registering user with email: ${dto.email}`);

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(dto.password, 12);
    console.log(`User: ${dto.email} userName: ${dto.firstName} .`);

    // 3. Create the User entity
    const newUser = this.userRepository.create({
      email: dto.email,
      first_name: dto.firstName,
      last_name: dto.lastName,
      password_hash: passwordHash,
    });
    console.log(`Created new user entity for email: ${newUser}`);

    const savedUser = await this.userRepository.save(newUser);

    // 4. Create the associated Profile entity
    const newProfile =
      await this.profileRepository.createEmptyProfileForUser(savedUser);

    const registerJWT = jwt.sign(
      { userId: savedUser.id },
      process.env.JWT_SECRET || "OBSCURA_DEV_SECRET_KEY",
      { expiresIn: "1h" },
    );
    // Send welcome email with email Verification
    await this.emailService.sendWelcomeMailEmail(
      savedUser.email,
      "Welcome to Obscura!",
      registerJWT,
      `${savedUser.first_name} ${savedUser.last_name}`,
    );

    // 5. Generate and return a token
    return this.generateAuthToken(savedUser, newProfile);
  }
  public async validateToken(dto: { token: string }) {
    const JWT_SECRET = process.env.JWT_SECRET || "OBSCURA_DEV_SECRET_KEY";

    try {
      const decoded = jwt.verify(dto.token, JWT_SECRET);
      console.log("decoded jwt", decoded);

      await this.userRepository.findOneByOrFail({ id: decoded.userId });
      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      throw {
        valid: false,
        payload: null,
      };
    }
  }

  /**
   * Logs in an existing user and returns a JWT.
   */
  public async login(dto: LoginDto) {
    // 1. Find the user by email
    const user = await this.userRepository.findByEmailWithProfile(dto.email);
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    console.log(`User ${user} logged in successfully.`);

    // 3. Generate and return a token
    if (!user.profile) {
      throw new Error("Login failed: User has no associated profile.");
    }

    return this.generateAuthToken(user, user.profile);
  }

  public async passwordReset(dto: { email: string }) {
    // Implementation for password reset logic
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error("No user found with this email.");
    }

    // Generate a password reset token and send email (not implemented here)

    const resetJWT = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "OBSCURA_DEV_SECRET_KEY",
      { expiresIn: "1h" },
    );

    await this.emailService.sendVerificationEmail(
      user.email,
      "Password Reset Request",
      resetJWT,
      user.email,
    );
    console.log(`Password reset token for user ${user.email}: ${resetJWT}`);
    // Here you would send the resetJWT to the user's email address
    //

    return { message: "Password reset link has been sent to your email." };
  }

  public async newPassword(dto: {
    temporaryToken: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    // Implementation for password reset logic
    const { temporaryToken, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirmation do not match.");
    }

    const decoded: any = jwt.verify(
      temporaryToken,
      process.env.JWT_SECRET || "OBSCURA_DEV_SECRET_KEY",
    );

    if (!decoded || !decoded.userId) {
      throw new Error("Invalid or expired token.");
    }

    const user = await this.userRepository.findOneBy({ id: decoded.userId });

    if (!user) {
      throw new Error("No user found with this email.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    user.password_hash = passwordHash;
    await this.userRepository.save(user);

    console.log(`Password updated successfully for user ${user.email}.`);

    return { message: "Password has been updated successfully." };
  }

  /**
   * Generates a signed JSON Web Token (JWT) for an authenticated user.
   */
  private generateAuthToken(user: User, profile: Profile) {
    const payload: RegisterPayload = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
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
