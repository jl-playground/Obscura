import { Model, DataTypes } from 'sequelize';

import type Connection from './connection.entity';
import type Profile from './profile.entity';
import type UserAnswer from './userAnswer.entity';
import type {
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;

  declare email: string;

  declare first_name: string;

  declare last_name: string;

  declare password_hash: string;

  declare created_at: CreationOptional<Date>;

  declare updated_at: CreationOptional<Date>;

  // Association mixins
  declare getProfile: HasOneGetAssociationMixin<Profile>;

  declare setProfile: HasOneSetAssociationMixin<Profile | null, string>;

  declare getConnectionsAsA: HasManyGetAssociationsMixin<Connection>;

  declare getConnectionsAsB: HasManyGetAssociationsMixin<Connection>;

  declare getUserAnswers: HasManyGetAssociationsMixin<UserAnswer>;

  // Non-attribute properties
  declare profile?: NonAttribute<Profile>;

  declare connectionsAsA?: NonAttribute<Connection[]>;

  declare connectionsAsB?: NonAttribute<Connection[]>;

  declare userAnswers?: NonAttribute<UserAnswer[]>;

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        password_hash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'user',
        timestamps: true,
        underscored: true,
      },
    );
    return User;
  }

  static associate(): void {}
}
