import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
  NonAttribute,
} from 'sequelize';
import type Connection from './connection.entity';
import type Message from './message.entity';

export default class Room extends Model<
  InferAttributes<Room>,
  InferCreationAttributes<Room>
> {
  declare id: CreationOptional<string>;
  declare connection_id: ForeignKey<string>;
  declare deleted_at: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare connection?: NonAttribute<Connection>;
  declare messages?: NonAttribute<Message[]>;

  // Mixins
  declare getConnection: BelongsToGetAssociationMixin<Connection>;
  declare getMessages: HasManyGetAssociationsMixin<Message>;

  static initModel(sequelize: any) {
    Room.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        connection_id: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: 'connection',
            key: 'id',
          },
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
        tableName: 'room',
        timestamps: true,
        underscored: true,
        paranoid: true,
      }
    );

    return Room;
  }
}
