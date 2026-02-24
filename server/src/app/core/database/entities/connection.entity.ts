import { Model, DataTypes } from 'sequelize';

import type User from './user.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  NonAttribute,
  Sequelize,
} from 'sequelize';

export default class Connection extends Model<InferAttributes<Connection>, InferCreationAttributes<Connection>> {
  declare id: CreationOptional<string>;

  declare user_a_id: ForeignKey<string>;

  declare user_b_id: ForeignKey<string>;

  declare status: 'PENDING' | 'REVEALED';

  declare message_count: number;

  declare user_a_reveal_vote: boolean | null;

  declare user_b_reveal_vote: boolean | null;

  declare deleted_at: CreationOptional<Date | null>;

  declare created_at: CreationOptional<Date>;

  declare updated_at: CreationOptional<Date>;

  // Associations
  declare userA?: NonAttribute<User>;

  declare userB?: NonAttribute<User>;

  // Mixins
  declare getUser: BelongsToGetAssociationMixin<User>;

  declare setUser: BelongsToSetAssociationMixin<User, string>;

  static initModel(sequelize: Sequelize): typeof Connection {
    Connection.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_a_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id',
          },
        },
        user_b_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id',
          },
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'REVEALED'),
          defaultValue: 'PENDING',
          allowNull: false,
        },
        message_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
        },
        user_a_reveal_vote: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        user_b_reveal_vote: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'connection',
        timestamps: true,
        underscored: true,
        paranoid: true,
      },
    );

    return Connection;
  }
}
