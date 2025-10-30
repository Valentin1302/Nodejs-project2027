import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class products extends Model<InferAttributes<products>, InferCreationAttributes<products>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;

  static initModel(sequelize: Sequelize): typeof products {
    products.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'products', modelName: 'Product', timestamps: true }
    );
    return products;
  }
}
