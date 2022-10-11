"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
const accounts_1 = require("./accounts");
const sellAirtimeModel_1 = require("./sellAirtimeModel");
const withdrawalHistory_1 = require("./withdrawalHistory");
class userInstance extends sequelize_1.Model {
}
exports.userInstance = userInstance;
userInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
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
        type: sequelize_1.DataTypes.STRING,
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
        type: sequelize_1.DataTypes.STRING,
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
        type: sequelize_1.DataTypes.STRING,
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
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
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
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7nG8OgXmMOXXiwbNOc-PPXUcilcIhCkS9BQ&usqp=CAU',
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: null,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'user',
    },
    walletBalance: {
        type: sequelize_1.DataTypes.NUMBER,
        defaultValue: 0,
    },
}, {
    sequelize: database_config_1.default,
    tableName: 'Users',
});
userInstance.hasMany(accounts_1.AccountInstance, { foreignKey: 'userId', as: 'accounts' });
userInstance.hasMany(withdrawalHistory_1.WithdrawHistoryInstance, { foreignKey: 'userId', as: 'withdrawBalance' });
userInstance.hasMany(sellAirtimeModel_1.SellAirtimeInstance, { foreignKey: 'userId', as: 'SellAirtime' });
accounts_1.AccountInstance.belongsTo(userInstance, { foreignKey: 'userId', as: 'Users' });
withdrawalHistory_1.WithdrawHistoryInstance.belongsTo(userInstance, { foreignKey: 'userId', as: 'Users' });
sellAirtimeModel_1.SellAirtimeInstance.belongsTo(userInstance, { foreignKey: 'userId', as: 'Users' });
//# sourceMappingURL=userModel.js.map