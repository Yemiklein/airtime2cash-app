import { DataTypes, Model } from 'sequelize';
import db from '../config/database.config';

interface AccountAttribute {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  userId: string;
}

export class AccountInstance extends Model<AccountAttribute> {
    [x: string]: any;
}

AccountInstance.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    accountNumber: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },

    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },

  },

  {
    sequelize: db,
    tableName: 'accounts',
  },
);
