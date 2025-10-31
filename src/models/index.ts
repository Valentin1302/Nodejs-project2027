import path from 'node:path';
import { Sequelize } from 'sequelize';
import { User } from './user';
import { Category } from './category';
import { Paiement } from './paiement';
import { Instructor } from './instructor';
import { Course } from './course';


export interface Database {
  sequelize: Sequelize;
  models: {
    User: typeof User;
    Category: typeof Category;
    Paiement: typeof Paiement;
    Instructor: typeof Instructor;
    Course: typeof Course;
  };
}

export type DbOptions = {
  storage?: string;
  logging?: boolean | ((sql: string) => void);
  inMemory?: boolean;
};

export function createDatabase(opts: DbOptions = {}): Database {
  let database = '../../data-development.sqlite';
  if (process.env.NODE_ENV === 'prod') {
    database = '../../data-development.sqlite';
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
  Category.initModel(sequelize);
  Paiement.initModel(sequelize);
  Instructor.initModel(sequelize);
  Course.initModel(sequelize);
  // Associations
  Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Course.belongsTo(Instructor, { foreignKey: 'instructorId', as: 'instructor' });
  

  return {
    sequelize,
    models: { User, Category, Paiement, Instructor, Course },
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
