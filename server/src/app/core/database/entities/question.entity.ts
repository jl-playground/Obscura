import { Model, DataTypes } from 'sequelize';

import { questionConfig } from '@/app/config/question.config';

import type UserAnswer from './userAnswer.entity';
import type {
  Sequelize,
  HasManyGetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';

export default class Question extends Model<InferAttributes<Question>, InferCreationAttributes<Question>> {
  declare id: CreationOptional<string>;

  declare text: string;

  declare type: 'MULTIPLE_CHOICE' | 'TEXT' | 'SCALE';

  declare options: CreationOptional<Record<string, string> | null>;

  declare created_at: CreationOptional<Date>;

  declare updated_at: CreationOptional<Date>;

  declare deleted_at: CreationOptional<Date | null>;

  // Associations
  declare userAnswers?: NonAttribute<UserAnswer[]>;

  declare getUserAnswers: HasManyGetAssociationsMixin<UserAnswer>;

  static initModel(sequelize: Sequelize): typeof Question {
    Question.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM(
            questionConfig.QUESTION_TYPES.MULTIPLE_CHOICE,
            questionConfig.QUESTION_TYPES.TEXT,
            questionConfig.QUESTION_TYPES.SCALE,
          ),
          allowNull: false,
          defaultValue: questionConfig.DEFAULT_QUESTION_TYPE,
        },
        options: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'question',
        timestamps: true,
        underscored: true,
        paranoid: true, // Soft delete with deleted_at
      },
    );

    return Question;
  }
}
