import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Instructor extends Model<InferAttributes<Instructor>, InferCreationAttributes<Instructor>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare bio: string | null;
  declare latitude: number | null;
  declare longitude: number | null;

  static initModel(sequelize: Sequelize): typeof Instructor {
    Instructor.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        bio: { type: DataTypes.STRING(1000), allowNull: true },
        latitude: { type: DataTypes.FLOAT, allowNull: true },
        longitude: { type: DataTypes.FLOAT, allowNull: true },
      },
      { sequelize, tableName: 'instructors', modelName: 'Instructor', timestamps: true }
    );
    return Instructor;
  }
}
