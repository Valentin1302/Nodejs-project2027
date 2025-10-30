import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class cacategory extends Model<InferAttributes<cacategory>, InferCreationAttributes<cacategory>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;

  static initModel(sequelize: Sequelize): typeof cacategory {
    cacategory.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'artists', modelName: 'Artist', timestamps: true }
    );
    return cacategory;
  }
}
