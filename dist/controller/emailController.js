"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.emailTemplate = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const utils_1 = require("../utils/utils");
// EMAIL SERVER CONFIGURATION
let transporter = nodemailer_1.default.createTransport({
    // service: 'outlook',
    // port: 587,
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});
// EMAIL SENDING FUNCTION
const emailTemplate = async (emailData) => {
    return new Promise((resolve, reject) => {
        const { from, to, subject, text, html } = emailData;
        !from && (emailData.from = process.env.EMAIL_USERNAME);
        const mailOptions = {
            from,
            to,
            subject,
            text,
            html,
        };
        try {
            const validationResult = utils_1.sendEmail.validate(emailData, utils_1.options);
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
        }
        catch (err) {
            reject(err);
        }
    });
};
exports.emailTemplate = emailTemplate;
// DYNAMIC EMAIL SENDING FUNCTION
async function sendMail(req, res) {
    (0, exports.emailTemplate)(req.body)
        .then((data) => {
        res.status(200).json(data);
    })
        .catch((err) => {
        res.status(500).json(err);
    });
}
exports.sendMail = sendMail;
//# sourceMappingURL=emailController.js.map