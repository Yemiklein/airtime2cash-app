import { DataTypes, Model } from "sequelize";
import db from '../config/database.config';


interface AccountAttribute {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    userId: string;
    walletBalance: number;
}

export class AccountInstance extends Model<AccountAttribute> {}

AccountInstance.init(
    {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },

    bankName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    accountNumber: {
        unique: true,
        type: DataTypes.STRING,
        allowNull: false
    },

    accountName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    userId: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },

    walletBalance: {
        type: DataTypes.NUMBER,
        defaultValue: 0
    },
    },

    {
        sequelize: db,
        tableName: 'accounts'
    }
);
