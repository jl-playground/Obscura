import db from './entities';
import Connection from './entities/connection.entity';
import Profile from './entities/profile.entity';
import DailyBatch from './entities/dailyBatch.entity';
import User from './entities/user.entity';
import UserAnswer from './entities/userAnswer.entity';

import type Question from './entities/question.entity';
import type { Sequelize } from 'sequelize';

export interface DBModels {
  User: typeof User;
  Profile: typeof Profile;
  Connection: typeof Connection;
  Question: typeof Question;
  UserAnswer: typeof UserAnswer;
  DailyBatch: typeof DailyBatch;
  Room: any;
  Message: any;
  // TrackerType: any;
}

export default class Database {
  private static instance: Database;

  public sequelize: Sequelize;

  // private TrackerType: typeof TrackerType;
  private user: typeof User;

  private constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
    // this.TrackerType = TrackerType.initModel(sequelize);
    this.user = User.initModel(sequelize);

    this.associate();
  }

  public static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database(db.sequelize);
    return Database.instance;
  }

  private associate() {
    // this.Tracker.hasOne(this.TrackerTelemetry, {
    //   as: 'telemetry',
    //   foreignKey: 'tracker_uuid',
    // });
    // this.Tracker.belongsTo(this.TrackerType, {
    //   as: 'type',
    //   foreignKey: 'uuid',
    // });
    // this.TrackerTelemetry.belongsTo(this.Tracker, {
    //   as: 'tracker',
    //   foreignKey: 'tracker_uuid',
    // });
    //
    this.user.hasOne(Profile, {
      foreignKey: 'user_id',
      as: 'profile',
    });
    User.hasMany(Connection, {
      foreignKey: 'user_a_id',
      as: 'connectionsAsA',
    });
    User.hasMany(Connection, {
      foreignKey: 'user_b_id',
      as: 'connectionsAsB',
    });
    User.hasMany(UserAnswer, {
      foreignKey: 'user_id',
      as: 'userAnswers',
    });
    User.hasMany(DailyBatch, {
      foreignKey: 'user_id',
      as: 'dailyBatches',
    });
  }

  get models(): DBModels {
    return {
      User: db.User as typeof User,
      Profile: db.Profile as typeof Profile,
      Connection: db.Connection as typeof Connection,
      Question: db.Question as typeof Question,
      UserAnswer: db.UserAnswer as typeof UserAnswer,
      DailyBatch: db.DailyBatch as typeof DailyBatch,
      Room: db.Room,
      Message: db.Message,
      // TrackerTelemetry: db.TrackerTelemetry,
    };
  }
}
