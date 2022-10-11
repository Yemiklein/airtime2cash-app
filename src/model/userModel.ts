import { DataTypes, Model } from 'sequelize';
import db from '../config/database.config';
import { AccountInstance } from './accounts';
import { SellAirtimeInstance } from './sellAirtimeModel';
import { WithdrawHistoryInstance } from './withdrawalHistory';
export interface userAttributes {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  avatar: string;
  isVerified?: Boolean;
  token?: string;
  role?: string;
  walletBalance?: number;
}

export class userInstance extends Model<userAttributes> {
  [x: string]: any;
}

userInstance.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'full name is required',
        },
        notEmpty: {
          msg: 'Please provide full name',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'last name is required',
        },
        notEmpty: {
          msg: 'Please provide last name',
        },
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'last name is required',
        },
        notEmpty: {
          msg: 'Please provide last name',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'email is required',
        },
        isEmail: {
          msg: 'Please provide a valid email',
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'password is required',
        },
        notEmpty: {
          msg: 'Please provide a password',
        },
      },
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7nG8OgXmMOXXiwbNOc-PPXUcilcIhCkS9BQ&usqp=CAU',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
    },
    walletBalance: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
  },
  {
    sequelize: db,
    tableName: 'Users',
  },
);

userInstance.hasMany(AccountInstance, { foreignKey: 'userId', as: 'accounts' });
userInstance.hasMany(WithdrawHistoryInstance, { foreignKey: 'userId', as: 'withdrawBalance' });
userInstance.hasMany(SellAirtimeInstance, {foreignKey: 'userId', as: 'SellAirtime'})
AccountInstance.belongsTo(userInstance, { foreignKey: 'userId', as: 'Users' });
WithdrawHistoryInstance.belongsTo(userInstance, { foreignKey: 'userId', as: 'Users' });
SellAirtimeInstance.belongsTo(userInstance, {foreignKey: 'userId', as: 'Users'})
