"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.withdraw = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const utils_1 = require("../utils/utils");
const withdrawalHistory_1 = require("../model/withdrawalHistory");
const accounts_1 = require("../model/accounts");
const userModel_1 = require("../model/userModel");
const fluter_1 = require("./fluter");
const withdraw = async (req, res, next) => {
    const id = (0, uuid_1.v4)();
    try {
        let costomerId;
        //   get user id from validated token and use it to get user account
        const userId = req.user.id;
        const { amount, accountNumber, bank, password, accountName } = req.body;
        const validatedInput = await utils_1.withdrawSchema.validate(req.body, utils_1.options);
        if (validatedInput.error) {
            return res.status(400).json(validatedInput.error.details[0].message);
        }
        const user = await userModel_1.userInstance.findOne({ where: { id: userId } });
        // console.log(user); // les see validated we have here
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const validatedUser = await bcryptjs_1.default.compare(password, user.password);
        if (!validatedUser) {
            return res.status(401).json({ message: 'wrong password inputed' });
        }
        // get destination account here where we are sending money to
        const account = await accounts_1.AccountInstance.findOne({ where: { accountNumber } });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        // confirm destination account is registered with the users ID  here before sendind the money out
        costomerId = account.userId;
        if (costomerId !== userId) {
            return res.status(401).json({ message: 'Sorry this account is not registered by you!' });
        }
        // check if user has enough money to withdraw from wallet
        const currentWalletBalance = user.walletBalance;
        if (currentWalletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        //  withdraw from user wallet aallow payment gateway to come in here
        let allBanks = await (0, fluter_1.getAllBanksNG)();
        const bankCode = allBanks.data.filter((item) => item.name.toLowerCase() == bank.toLowerCase());
        let code = bankCode[0].code;
        // return res.status(200).json({ message: 'Bank code', code, allBanks });
        const details = {
            account_bank: code,
            account_number: accountNumber,
            amount: amount,
            narration: 'Airtime for cash',
            currency: 'NGN',
            callback_url: 'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
            debit_currency: 'NGN',
        };
        const result = await (0, fluter_1.initTrans)(details);
        //  withdraw from user wallet and update user wallet balance
        if (result.status === 'success') {
            const newBalance = currentWalletBalance - amount;
            const withdraw = await userModel_1.userInstance.update({ walletBalance: newBalance }, { where: { id: userId } });
            const transaction = await withdrawalHistory_1.WithdrawHistoryInstance.create({
                id: id,
                userId: userId,
                amount: amount,
                accountNumber: accountNumber,
                bank,
                status: true,
            });
            return res.status(201).json({
                message: 'Withdraw successful',
                newBalance: newBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                transaction,
            });
        }
        else {
            await withdrawalHistory_1.WithdrawHistoryInstance.create({
                id: id,
                userId: userId,
                amount: amount,
                accountNumber: accountNumber,
                bank,
                status: false,
            });
            return res.status(400).json({ message: 'Network Error. Withdraw failed' });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error,
        });
    }
};
exports.withdraw = withdraw;
// get all transactions
const getTransactions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const transactions = await withdrawalHistory_1.WithdrawHistoryInstance.findAll({ where: { userId } });
        if (!transactions) {
            return res.status(404).json({ message: 'No transactions found' });
        }
        return res.status(200).json({ transactions });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error,
        });
    }
};
exports.getTransactions = getTransactions;
//# sourceMappingURL=withdraw.js.map