import express from 'express';
import nodemailer from 'nodemailer';
import { sendEmail, options } from '../utils/utils';
// EMAIL SERVER CONFIGURATION
let transporter = nodemailer.createTransport({
  // service: 'outlook',
  // port: 587,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
  tls: {
    rejectUnauthorized: false
}

});
// EMAIL SENDING FUNCTION
export const emailTemplate = async (emailData: Record<string, string>) => {
  return new Promise((resolve, reject) => {
    const { from, to, subject, text, html } = emailData;
    !from && (emailData.from = process.env.EMAIL_USERNAME as string);
    const mailOptions = {
      from,
      to,
      subject,
      text,
      html,
    };
    try {
      const validationResult = sendEmail.validate(emailData, options);
      if (validationResult.error) {
        reject({
          Error: validationResult.error.details[0].message,
        });
      }
      transporter
        .sendMail(mailOptions)
        .then((info) => {
          resolve({
            message: 'email sent successfully',
            info,
          });
        })
        .catch((err) => {
          resolve({
            message: 'An error occurred',
            err,
          });
        });
    } catch (err) {
      reject(err);
    }
  });
};
// DYNAMIC EMAIL SENDING FUNCTION
export async function sendMail(req: express.Request, res: express.Response) {
  emailTemplate(req.body)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
}
