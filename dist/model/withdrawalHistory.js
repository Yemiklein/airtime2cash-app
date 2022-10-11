"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawHistoryInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class WithdrawHistoryInstance extends sequelize_1.Model {
}
exports.WithdrawHistoryInstance = WithdrawHistoryInstance;
WithdrawHistoryInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    accountNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    bank: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_config_1.default,
    tableName: 'withdrawBalance',
});
//# sourceMappingURL=withdrawalHistory.js.map