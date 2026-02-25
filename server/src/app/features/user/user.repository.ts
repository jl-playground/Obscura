import Database from '@/app/core/database/database';

import type User from '@/app/core/database/entities/user.entity';
import type { CreationAttributes, ModelStatic } from 'sequelize';

type UserUpdateValues = Parameters<ModelStatic<User>['update']>[0];

export default class UserRepository {
  private models = Database.getInstance().models;

  public async findAll(): Promise<User[]> {
    return this.models.User.findAll();
  }

  public async findByPk(id: string): Promise<User | null> {
    return this.models.User.findByPk(id);
  }

  public async findByEmail(email: string): Promise<User | null> {
    console.log(`Searching for user with email: ${email}`);
    return this.models.User.findOne({
      where: { email },
    });
  }

  public async create(data: CreationAttributes<User>): Promise<User> {
    return this.models.User.create(data);
  }

  public async update(
    id: string,
    data: Partial<Pick<CreationAttributes<User>, 'email' | 'first_name' | 'last_name' | 'password_hash'>>,
  ): Promise<[affectedCount: number, affectedRows: User[]]> {
    const updatePayload = this.removeUndefinedFields(data);
    const [affectedCount] = await this.models.User.update(updatePayload as UserUpdateValues, {
      where: { id },
    });

    const updatedUser = affectedCount > 0 ? await this.models.User.findByPk(id) : null;
    return [affectedCount, updatedUser ? [updatedUser] : []];
  }

  private removeUndefinedFields(
    data: Partial<Omit<CreationAttributes<User>, 'id'>>,
  ): Partial<CreationAttributes<User>> {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<
      CreationAttributes<User>
    >;
  }

  public async delete(id: string): Promise<number> {
    return this.models.User.destroy({
      where: { id },
    });
  }
}
