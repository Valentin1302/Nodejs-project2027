import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string | null;
  declare categoryId: number | null;
  declare instructorId: number | null;
  declare price: number | null;

  static initModel(sequelize: Sequelize): typeof Course {
    Course.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        categoryId: { type: DataTypes.INTEGER, allowNull: true },
        instructorId: { type: DataTypes.INTEGER, allowNull: true },
        price: { type: DataTypes.FLOAT, allowNull: true },
      },
      { sequelize, tableName: 'courses', modelName: 'Course', timestamps: true }
    );
    return Course;
  }
}
