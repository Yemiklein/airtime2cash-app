import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4, validate } from 'uuid';
import { AccountInstance } from '../model/accounts';
import { SellAirtimeInstance } from '../model/sellAirtimeModel';
import { userInstance } from '../model/userModel';
import { createAccountSchema, options, postAirTimeSchema } from '../utils/utils';
import { emailTemplate } from './emailController';

export async function postSellAirtime(req: Request | any, res: Response, next: NextFunction) {
  try {
    const id = uuidv4();
    const { network, phoneNumber, amountToSell, amountToReceive } = req.body;
    const userId = req.user.id;

    const validateSellAirtime = await postAirTimeSchema.validate(req.body, options);
    if (validateSellAirtime.error) {
      return res.status(400).json(validateSellAirtime.error.details[0].message);
    }
    const validUser = await userInstance.findOne({ where: { id: userId } });
    if (!validUser) {
      return res.status(401).json({ message: 'Sorry user does not exist' });
    }
    let email = validUser.email 
    // console.log(validUser.email);

    const firstName = validUser.firstName;
    const lastName = validUser.lastName;
    const transactions = await SellAirtimeInstance.create({
      id: id,
      userId,
      email,
      network,
      phoneNumber,
      amountToSell,
      amountToReceive,
    });

    if (!transactions) {
      res.status(404).json({ message: 'Sorry, transaction was not successful' });
    }

    const link = `${process.env.FRONTEND_URL}/dashboard/admin`;
    const emailData = {
      to: `${process.env.ADMIN_EMAIL}`,
      subject: 'Confirm Airtime Transfer',
      html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
            margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="color: teal;">Confirm Airtime Transfer</h2>
            <p>Please Follow the link by clicking on the button to confirm airtime transfer from:
             </p>
             <p>User Name: ${firstName + ' ' + lastName}</p>
             <p>Email: ${email}</p>
             <p>Phone Number: ${phoneNumber}</p>
             <p>Amount: ${amountToSell}</p>
             <div style='text-align:center ;'>
               <a href=${link}
              style="background: #277BC0; text-decoration: none; color: white;
               padding: 10px 20px; margin: 10px 0;
              display: inline-block;">Click here</a>
             </div>
          </div>`,
    };
    emailTemplate(emailData);
    return res.status(201).json(transactions);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error });
  }
}

export async function allTransactions(req: Request | any, res: Response, next: NextFunction) {
  try {
    const pageAsNumber = Number.parseInt(req.query.page);
    const sizeAsNumber = Number.parseInt(req.query.size);
    let page = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
      page = pageAsNumber;
    }

    let size = 15;
    if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 15) {
      size = sizeAsNumber;
    }

    const transactions = await SellAirtimeInstance.findAndCountAll({
      limit: size,
      offset: page * size,
      order: [['createdAt', 'DESC']]
    });


    if (!transactions) {
      return res.status(404).json({ message: 'No transaction found' });
    }
    return res.send({
      content: transactions.rows,
      totalPages: Math.ceil(transactions.count / size),
      totalTransactions: transactions.count
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error,
    });
  }
}

export async function pendingTransactions(req: Request | any, res: Response, next: NextFunction) {
  try {
    const pageAsNumber = Number.parseInt(req.query.page);
    const sizeAsNumber = Number.parseInt(req.query.size);
    const allPending = req.query.allPending;
    let page = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
      page = pageAsNumber;
    }

    let size = 15;
    if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 15) {
      size = sizeAsNumber;
    }

    const transactions = await SellAirtimeInstance.findAndCountAll({
      where: { transactionStatus: allPending},
      limit: size,
      offset: page * size,
      order: [['createdAt', 'DESC']]
    });


    if (!transactions) {
      return res.status(404).json({ message: 'No transaction found' });
    }
    return res.send({
      content: transactions.rows,
      totalPages: Math.ceil(transactions.count / size),
      totalTransactions: transactions.count
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error,
    });
  }
}


