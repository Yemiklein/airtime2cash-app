"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellAirtimeInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class SellAirtimeInstance extends sequelize_1.Model {
}
exports.SellAirtimeInstance = SellAirtimeInstance;
SellAirtimeInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUIDV4,
        // primaryKey: false,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    network: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    amountToSell: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    amountToReceive: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    transactionStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pending',
    },
}, {
    sequelize: database_config_1.default,
    tableName: 'SellAirtime',
});
//# sourceMappingURL=sellAirtimeModel.js.map