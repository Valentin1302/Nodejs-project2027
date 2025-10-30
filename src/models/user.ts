import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string | null;

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
      },
      {
        sequelize,
        tableName: 'users',
        modelName: 'User',
        timestamps: true,
      }
    );
    return User;
  }
}
