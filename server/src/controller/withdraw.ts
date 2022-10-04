import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { withdrawSchema, options } from '../utils/utils';
import { WithdrawHistoryInstance } from '../model/withdrawalHistory';
import { AccountInstance } from '../model/accounts';
import { userInstance } from '../model/userModel';

const Flutterwave = require('flutterwave-node-v3');
// const flw = new Flutterwave(String(process.env.FLUTTERWAVE_PUBLIC_KEY), String(process.env.FLUTTERWAVE_SECRET_KEY));
const flw = new Flutterwave(
  'FLWPUBK_TEST-ab9110a6e892c4d8003972c67262c709-X',
  'FLWSECK_TEST-7b7484a72d3c70d324c71e63d399b879-X',
);

export const withdraw = async (req: Request | any, res: Response, next: NextFunction) => {
  const id = uuidv4();

  try {
    let costomerId: string | any;
    //   get user id from validated token and use it to get user account
    const userId = req.user.id;

    const { amount, accountNumber, bank, password, accountName } = req.body;

    const validatedInput = await withdrawSchema.validate(req.body, options);
    if (validatedInput.error) {
      return res.status(400).json(validatedInput.error.details[0].message);
    }

    const user = await userInstance.findOne({ where: { id: userId } });
    // console.log(user); // les see validated we have here
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const validatedUser = await bcrypt.compare(password, user.password);
    if (!validatedUser) {
      return res.status(401).json({ message: 'wrong password inputed' });
    }
    // get destination account here where we are sending money to
    const account = await AccountInstance.findOne({ where: { accountNumber } });
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
    const details = {
      account_bank: bank,
      account_number: accountNumber,
      amount: amount,
      currency: 'NGN',
      narration: 'Withdrawal from airtime2cash wallet',
      reference: 'airtime2cash',
      callback_url: 'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
    };
    flw.Transfer.initiate(details).then(console.log).catch(console.log);

    //  withdraw from user wallet and update user wallet balance
    const newBalance = currentWalletBalance - amount;
    const withdraw = await userInstance.update({ walletBalance: newBalance }, { where: { id: userId } });
    const transaction = await WithdrawHistoryInstance.create({
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
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error,
    });
  }
};

// get all transactions
export const getTransactions = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const transactions = await WithdrawHistoryInstance.findAll({ where: { userId } });
    if (!transactions) {
      return res.status(404).json({ message: 'No transactions found' });
    }
    return res.status(200).json({ transactions });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error,
    });
  }
};
