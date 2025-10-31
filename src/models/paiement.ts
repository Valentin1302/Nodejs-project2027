import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Paiement extends Model<InferAttributes<Paiement>, InferCreationAttributes<Paiement>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;

  static initModel(sequelize: Sequelize): typeof Paiement {
    Paiement.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'paiements', modelName: 'Paiement', timestamps: true }
    );
    return Paiement;
  }
}
