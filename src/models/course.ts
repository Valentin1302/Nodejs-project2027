import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string | null;
  declare price: number | null;
  declare categoryName: string;     // Remplace categoryId
  declare instructorName: string;   // Remplace instructorId

  static initModel(sequelize: Sequelize): typeof Course {
    Course.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        price: { type: DataTypes.FLOAT, allowNull: true },
        categoryName: { type: DataTypes.STRING(120), allowNull: false },
        instructorName: { type: DataTypes.STRING(120), allowNull: false },
      },
      {
        sequelize,
        tableName: 'courses',
        modelName: 'Course',
        timestamps: true,
      }
    );
    return Course;
  }
}
