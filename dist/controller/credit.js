"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credit = void 0;
const userModel_1 = require("../model/userModel");
const utils_1 = require("../utils/utils");
const uuid_1 = require("uuid");
const sellAirtimeModel_1 = require("../model/sellAirtimeModel");
const emailController_1 = require("./emailController");
async function credit(req, res, next) {
    const id = (0, uuid_1.v4)();
    try {
        // const userID = req.user.id;
        const { email, amountToSend, status, transactionID } = req.body;
        // JOY VALIDATION
        const validatedInput = await utils_1.creditSchema.validateAsync(req.body, utils_1.options);
        if (validatedInput.error) {
            return res.status(400).json(validatedInput.error.details[0].message);
        }
        //  GET CUSTOMER BY EMAIL
        const customer = await userModel_1.userInstance.findOne({ where: { email } });
        console.log(customer);
        if (!customer) {
            return res.status(404).json({ message: "customer not found" });
        }
        // CREDIT THE USER WALLET
        const newCustomerWalletBalance = customer.walletBalance + amountToSend;
        const getTransaction = await sellAirtimeModel_1.SellAirtimeInstance.findOne({
            where: { id: transactionID, transactionStatus: "pending" }
        });
        if (!getTransaction) {
            return res.status(404).json({
                message: "Transaction not found",
                Transaction: getTransaction
            });
        }
        const updateStatus = await sellAirtimeModel_1.SellAirtimeInstance.update({
            transactionStatus: status
        }, { where: { id: transactionID, amountToReceive: amountToSend }
        });
        if (status === 'sent') {
            const creditedCustomer = await userModel_1.userInstance.update({ walletBalance: newCustomerWalletBalance }, { where: { email } });
            const link = `${process.env.FRONTEND_URL}/dashboard/admin`;
            const emailData = {
                to: `${process.env.ADMIN_EMAIL}`,
                subject: 'Payment Confirmed',
                html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
              margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="color: teal;">Confirm Transaction</h2>
              <p>You successfully transfer N${amountToSend} to ${customer.firstName + ' ' + customer.lastName}</p>
              <p>Email: ${email}</p>
              <p>Phone Number: ${customer.phoneNumber}</p>
              <p>Login to get more details</p>
              <a href=${link}
              style="background: #277BC0; text-decoration: none; color: white;
               padding: 10px 20px; margin: 10px 0;
              display: inline-block;">Click here</a>

            </div>`,
            };
            (0, emailController_1.emailTemplate)(emailData);
            const link2 = `${process.env.FRONTEND_URL}/login`;
            const emailData2 = {
                to: `${process.env.ADMIN_EMAIL}`,
                subject: 'Payment Confirmed',
                html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
              margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="color: teal;">Airtime2Cash Payment</h2>
              <p>You wallet has been credited successfully with N${amountToSend}</p>
              <p>Login to get more details</p>
              <a href=${link2}
              style="background: #277BC0; text-decoration: none; color: white;
               padding: 10px 20px; margin: 10px 0;
              display: inline-block;">Click here</a>
            </div>`,
            };
            (0, emailController_1.emailTemplate)(emailData2);
            return res.status(201).json({
                message: `You have successful credited ${email} with the sum of ${amountToSend}`
            });
        }
        else {
            return res.status(500).json({
                message: "Transaction Cancelled"
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "fail to credit customer wallet"
        });
    }
}
exports.credit = credit;
//# sourceMappingURL=credit.js.map