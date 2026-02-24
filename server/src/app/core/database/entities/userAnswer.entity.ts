import { Model, DataTypes } from 'sequelize';

import type Question from './question.entity';
import type User from './user.entity';
import type {
  Sequelize,
  BelongsToGetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';

export default class UserAnswer extends Model<InferAttributes<UserAnswer>, InferCreationAttributes<UserAnswer>> {
  declare id: CreationOptional<string>;

  declare user_id: string;

  declare question_id: string;

  declare answer_value: string;

  declare created_at: CreationOptional<Date>;

  declare updated_at: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;

  declare question?: NonAttribute<Question>;

  declare getUser: BelongsToGetAssociationMixin<User>;

  declare getQuestion: BelongsToGetAssociationMixin<Question>;

  static initModel(sequelize: Sequelize): typeof UserAnswer {
    UserAnswer.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id',
          },
        },
        question_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'question',
            key: 'id',
          },
        },
        answer_value: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'user_answer',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['user_id', 'question_id'],
          },
        ],
      },
    );

    return UserAnswer;
  }
}
