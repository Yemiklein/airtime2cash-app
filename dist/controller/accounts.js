"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAccount = exports.deleteBankAccount = exports.getBankAccounts = exports.CreateAccount = void 0;
const uuid_1 = require("uuid");
const utils_1 = require("../utils/utils");
const accounts_1 = require("../model/accounts");
async function CreateAccount(req, res, next) {
    const id = (0, uuid_1.v4)();
    try {
        const userID = req.user.id;
        const ValidateAccount = await utils_1.createAccountSchema.validateAsync(req.body, utils_1.options);
        if (ValidateAccount.error) {
            return res.status(400).json({
                status: 'error',
                message: ValidateAccount.error.details[0].message,
            });
        }
        const duplicateAccount = await accounts_1.AccountInstance.findOne({
            where: { accountNumber: req.body.accountNumber },
        });
        if (duplicateAccount) {
            return res.status(409).json({
                message: 'Account number is used, please enter another account number',
            });
        }
        const record = await accounts_1.AccountInstance.create({
            id: id,
            bankName: req.body.bankName,
            accountNumber: req.body.accountNumber,
            accountName: req.body.accountName,
            userId: userID,
        });
        if (record) {
            return res.status(201).json({
                status: 'success',
                message: 'Account created successfully',
                data: record,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}
exports.CreateAccount = CreateAccount;
async function getBankAccounts(req, res, next) {
    try {
        const userId = req.user.id;
        const account = await accounts_1.AccountInstance.findAll({
            where: { userId: userId },
        });
        if (account) {
            return res.status(200).json({
                status: 'success',
                message: 'Account retrieved successfully',
                data: account,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
        });
    }
}
exports.getBankAccounts = getBankAccounts;
async function deleteBankAccount(req, res, next) {
    try {
        const id = req.params.id;
        const account = await accounts_1.AccountInstance.findOne({
            where: { id: id },
        });
        if (account) {
            await account.destroy();
            return res.status(200).json({
                status: 'success',
                message: 'Account deleted successfully',
            });
        }
        return res.status(404).json({
            status: 'error',
            message: 'Account not found',
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
        });
    }
}
exports.deleteBankAccount = deleteBankAccount;
async function getUserAccount(req, res, next) {
    try {
        const userID = req.user.id;
        const account = await accounts_1.AccountInstance.findOne({
            where: { userId: userID },
        });
        if (account) {
            return res.status(200).json({
                status: 'success',
                message: 'Account retrieved successfully',
                data: account,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
        });
    }
}
exports.getUserAccount = getUserAccount;
//# sourceMappingURL=accounts.js.map