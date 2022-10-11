import { DataTypes, Model } from 'sequelize';
import db from '../config/database.config';

interface WithdrawHistoryAttribute {
  id: string;
  amount: number;
  userId: string;
  status: boolean;
  accountNumber: string;
  bank: string;
}

export class WithdrawHistoryInstance extends Model<WithdrawHistoryAttribute> {}

WithdrawHistoryInstance.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    amount: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'withdrawBalance',
  },
);
