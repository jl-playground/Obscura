import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { DataTypes, Sequelize } from 'sequelize';

import rawConfig from '../config/config.cjs';

import type { Model, ModelStatic } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const env = process.env.NODE_ENV ?? 'development';
const configObject = rawConfig.default ?? rawConfig;
const config = configObject[env];

interface DbInterface {
  [key: string]: ModelStatic<Model> | Sequelize | typeof Sequelize;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = {};

let sequelize: Sequelize;

if (config.use_env_variable) {
  console.log(`Using environment variable for database connection: ${config.use_env_variable}`);
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  console.log(`Using direct configuration for database connection: ${config.database}`);
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// eslint-disable-next-line n/no-sync
const files = fs
  .readdirSync(__dirname)
  .filter(
    (file: string) =>
      !file.startsWith('.') &&
      file !== basename &&
      (file.endsWith('.js') || file.endsWith('.ts')) &&
      !file.includes('.test.ts'),
  );

// 3 & 4. Use a for...of loop with top-level await for dynamic imports
for (const file of files) {
  const modelPath = path.join(__dirname, file);

  // 5. Convert absolute path to a file:// URL for ESM dynamic import
  const fileUrl = pathToFileURL(modelPath).href;
  const modelDef = await import(fileUrl);

  const modelModule = modelDef.default ?? modelDef;

  if (modelModule.initModel) {
    const model = modelModule.initModel(sequelize);
    db[model.name] = model;
  } else if (typeof modelModule === 'function') {
    const model = modelModule(sequelize, DataTypes);
    db[model.name] = model;
  }
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db as DbInterface;
