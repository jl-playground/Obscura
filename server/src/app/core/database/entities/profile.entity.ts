import { DataTypes, Model } from 'sequelize';

import User from './user.entity';

import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  NonAttribute,
  ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize';
/**
 * Profile Model - Simplified for S3 storage
 * Pictures are stored separately in S3, not in this model
 * This model stores basic profile information and references to S3 objects
 */
export default class Profile extends Model<InferAttributes<Profile>, InferCreationAttributes<Profile>> {
  declare id: CreationOptional<string>;

  declare user_id: ForeignKey<User['id']>;

  declare bio: CreationOptional<string | null>;

  declare interests: CreationOptional<string[] | null>;

  declare created_at: CreationOptional<Date>;

  declare updated_at: CreationOptional<Date>;

  declare deleted_at: CreationOptional<Date | null>;

  // Association mixins
  declare getUser: BelongsToGetAssociationMixin<User>;

  declare setUser: BelongsToSetAssociationMixin<User, User['id']>;

  // Non-attribute properties
  declare user?: NonAttribute<User>;

  static initModel(sequelize: Sequelize): typeof Profile {
    Profile.init(
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
        bio: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        interests: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: null,
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
        tableName: 'profile',
        timestamps: true,
        underscored: true,
        paranoid: true, // Enables soft delete with deleted_at
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      },
    );

    return Profile;
  }

  static associate(): void {
    Profile.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }
}
