import bcrypt from 'bcrypt';

import { ProfileService } from '../profile/profile.service';

import UserRepository from './user.repository';

import type User from '@/app/core/database/entities/user.entity';
import type { CreationAttributes } from 'sequelize';

export default class UserService {
  private readonly repository: UserRepository;

  private readonly profileService: ProfileService;

  private readonly saltRounds = 10;

  constructor() {
    this.repository = new UserRepository();
    this.profileService = new ProfileService();
  }

  public async getAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }

  public async getUserById(id: string): Promise<User | null> {
    return this.repository.findByPk(id);
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  public async createUser(data: CreationAttributes<User>): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password_hash, this.saltRounds);

    const user = await this.repository.create({
      ...data,
      password_hash: hashedPassword,
    });

    // Create empty profile for the new user
    await this.profileService.createEmptyProfileForUser(user.id);

    return user;
  }

  public async updateUser(id: string, data: Partial<Omit<CreationAttributes<User>, 'id'>>): Promise<User | null> {
    // Hash password if provided
    const updateData = { ...data };
    if (updateData.password_hash) {
      updateData.password_hash = await bcrypt.hash(updateData.password_hash, this.saltRounds);
    }

    const [, updatedUsers] = await this.repository.update(id, updateData);
    return updatedUsers[0] ?? null;
  }

  public async deleteUser(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new Error(`User with id ${id} not found`);
  }

  public async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
