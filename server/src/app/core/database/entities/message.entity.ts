import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  BelongsToGetAssociationMixin,
  NonAttribute,
} from 'sequelize';
import type Room from './room.entity';
import type User from './user.entity';

export default class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare id: CreationOptional<string>;
  declare room_id: ForeignKey<string>;
  declare sender_id: ForeignKey<string>;
  declare content: string;
  declare deleted_at: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare room?: NonAttribute<Room>;
  declare sender?: NonAttribute<User>;

  // Mixins
  declare getRoom: BelongsToGetAssociationMixin<Room>;
  declare getSender: BelongsToGetAssociationMixin<User>;

  static initModel(sequelize: any) {
    Message.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        room_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'room',
            key: 'id',
          },
        },
        sender_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id',
          },
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
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
        tableName: 'message',
        timestamps: true,
        underscored: true,
        paranoid: true,
        indexes: [
          {
            fields: ['room_id', 'created_at'],
          },
          {
            fields: ['sender_id'],
          },
        ],
      }
    );

    return Message;
  }
}
