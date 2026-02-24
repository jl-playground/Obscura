import { DataTypes, Model } from 'sequelize';

import type User from './user.entity';
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  NonAttribute,
} from 'sequelize';

export default class DailyBatch extends Model<InferAttributes<DailyBatch>, InferCreationAttributes<DailyBatch>> {
  declare id: CreationOptional<string>;

  declare user_id: ForeignKey<User['id']>;

  declare matched_profile_ids: CreationOptional<string[]>;

  declare passed_profile_ids: CreationOptional<string[]>;

  declare connected_profile_ids: CreationOptional<string[]>;

  declare created_at: CreationOptional<Date>;

  declare updated_at: CreationOptional<Date>;

  declare deleted_at: CreationOptional<Date | null>;

  declare getUser: BelongsToGetAssociationMixin<User>;

  declare setUser: BelongsToSetAssociationMixin<User, User['id']>;

  declare user?: NonAttribute<User>;

  static initModel(sequelize: Sequelize): typeof DailyBatch {
    DailyBatch.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id',
          },
        },
        matched_profile_ids: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        passed_profile_ids: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        connected_profile_ids: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
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
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: 'daily_batch',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      },
    );

    return DailyBatch;
  }
}
