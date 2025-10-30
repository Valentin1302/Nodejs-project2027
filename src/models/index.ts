import path from 'node:path';
import { Sequelize } from 'sequelize';
import { User } from './user';
import { cacategory } from './cacategory';


export interface Database {
  sequelize: Sequelize;
  models: {
    User: typeof User;
    cacategory: typeof cacategory;
  };
}

export type DbOptions = {
  storage?: string;
  logging?: boolean | ((sql: string) => void);
  inMemory?: boolean;
};

export function createDatabase(opts: DbOptions = {}): Database {
  let database = '../../data-development.sqlite'
  if (process.env.NODE_ENV === 'prod') {
    database = '../../data-development.sqlite'
  }

  const storage = opts.inMemory
    ? ':memory:'
    : opts.storage ?? path.resolve(__dirname, database);

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: opts.logging ?? false,
  });

  // Init models
  User.initModel(sequelize);
  

  return {
    sequelize,
    models: { User },
  };
}

export type { User };

// Default database instance
// - Uses in-memory SQLite under test to keep tests isolated and fast
// - Disables logging by default to reduce noise
const _defaultDb = createDatabase({
  inMemory: process.env.NODE_ENV === 'test',
  logging: false,
});

// Flatten models on the default export to allow `models.sequelize` and `models.User`
const defaultExport = {
  sequelize: _defaultDb.sequelize,
  ..._defaultDb.models,
};

export default defaultExport;
