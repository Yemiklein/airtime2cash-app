"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class CreditInstance extends sequelize_1.Model {
}
exports.CreditInstance = CreditInstance;
CreditInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
    },
    amountToSell: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    transactionStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_config_1.default,
    tableName: 'Credit',
});
//# sourceMappingURL=credit.js.map