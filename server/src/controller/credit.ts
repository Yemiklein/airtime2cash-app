import express, { Request, Response, NextFunction } from 'express';
import { userInstance } from '../model/userModel';
import { creditSchema, options } from '../utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { SellAirtimeInstance } from '../model/sellAirtimeModel';
import { emailTemplate } from './emailController';
import speakeasy from "speakeasy";

export async function credit(req: Request | any, res: Response, next: NextFunction) {
    const id = uuidv4()
    try {
            // const userID = req.user.id;
            const { email, amountToSend, status, transactionID} = req.body;

            // JOI VALIDATION
            const validatedInput = await creditSchema.validateAsync(req.body, options);
          if (validatedInput.error) {
            return res.status(400).json(validatedInput.error.details[0].message);
          }

        //  GET CUSTOMER BY EMAIL
          const customer = await userInstance.findOne({where: {email}})
          console.log(customer)

          if(!customer){
              return res.status(404).json({message:"customer not found"})
          }


        // CREDIT THE USER WALLET
          const newCustomerWalletBalance = customer.walletBalance + amountToSend;


          const getTransaction = await SellAirtimeInstance.findOne({
            where:{id:transactionID, transactionStatus:"pending"}
          })
          if(!getTransaction){
            return res.status(404).json({
                message:"Transaction not found",
                Transaction:getTransaction
            })
          }


          const updateStatus = await SellAirtimeInstance.update({
            transactionStatus:status},{where:{id:transactionID, amountToReceive:amountToSend}
          })

          if(status === 'sent'){
          const creditedCustomer = await userInstance.update({walletBalance:newCustomerWalletBalance}, {where:{email}});

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
      emailTemplate(emailData);

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
      emailTemplate(emailData2);

          return res.status(201).json({
              message:`You have successful credited ${email} with the sum of ${amountToSend}`
          });
        }else{
            return res.status(500).json({
                message:"Transaction Cancelled"
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:"fail to credit customer wallet"
        })
    }
}

// // TWO FACTOR AUTHENTICATION

//  TO GENERATE A KEY
// export async function generate(req: Request | any, res: Response, next: NextFunction) {

//   const id = uuidv4();
//   try {
//     const path = `/wallet/${id}`;
//     // Create temporary secret until it it verified
//     const temp_secret = speakeasy.generateSecret({length:20});
//     // Create user in the database
//     // db.push(path, { id, temp_secret });
//     // Send user id and base32 key to user
//     res.json({ id, secret: temp_secret.base32 })
//   } catch(e) {
//     console.log(e);
//     res.status(500).json({ message: 'Error generating secret key'})
//   }
// }