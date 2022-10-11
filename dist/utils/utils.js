"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountSchema = exports.creditSchema = exports.postAirTimeSchema = exports.withdrawSchema = exports.createAccountSchema = exports.generateToken = exports.options = exports.resetPasswordSchema = exports.loginSchema = exports.updateUserSchema = exports.signUpSchema = exports.sendEmail = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.sendEmail = joi_1.default.object().keys({
    from: joi_1.default.string(),
    to: joi_1.default.string().required(),
    subject: joi_1.default.string().required(),
    text: joi_1.default.string(),
    html: joi_1.default.string().required(),
});
exports.signUpSchema = joi_1.default.object()
    .keys({
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    userName: joi_1.default.string().required(),
    email: joi_1.default.string().trim().lowercase().required(),
    phoneNumber: joi_1.default.string().required(),
    avatar: joi_1.default.string(),
    role: joi_1.default.string(),
    walletBalance: joi_1.default.number(),
    isVerified: joi_1.default.boolean(),
    password: joi_1.default.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' }),
})
    .with('password', 'confirmPassword');
exports.updateUserSchema = joi_1.default.object().keys({
    firstName: joi_1.default.string(),
    lastName: joi_1.default.string(),
    phoneNumber: joi_1.default.string(),
    avatar: joi_1.default.string(),
    userName: joi_1.default.string(),
    walletBalance: joi_1.default.number(),
    role: joi_1.default.string(),
});
exports.loginSchema = joi_1.default.object().keys({
    emailOrUsername: joi_1.default.string().trim().lowercase().required(),
    password: joi_1.default.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
});
exports.resetPasswordSchema = joi_1.default.object()
    .keys({
    password: joi_1.default.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' }),
})
    .with('password', 'confirmPassword');
exports.options = {
    abortEarly: false,
    errors: {
        wrap: {
            label: '',
        },
    },
};
const generateToken = (user) => {
    const pass = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_DURATION;
    return jsonwebtoken_1.default.sign(user, pass, { expiresIn });
};
exports.generateToken = generateToken;
exports.createAccountSchema = joi_1.default.object().keys({
    bankName: joi_1.default.string().trim().required(),
    accountNumber: joi_1.default.string()
        .trim()
        .required()
        .pattern(/^[0-9]+$/)
        .length(10),
    accountName: joi_1.default.string().trim().required(),
});
exports.withdrawSchema = joi_1.default.object().keys({
    amount: joi_1.default.number().required(),
    accountNumber: joi_1.default.string()
        .trim()
        .required()
        .pattern(/^[0-9]+$/)
        .length(10),
    bank: joi_1.default.string().trim().required(),
    accountName: joi_1.default.string().trim().required(),
    password: joi_1.default.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
});
exports.postAirTimeSchema = joi_1.default.object().keys({
    network: joi_1.default.string().required(),
    phoneNumber: joi_1.default.string()
        .trim()
        .required()
        .pattern(/^[0-9]+$/)
        .length(11),
    amountToSell: joi_1.default.number().required(),
    sharePin: joi_1.default.string()
        .trim()
        .required()
        .pattern(/^[0-9]+$/)
        .length(4),
    amountToReceive: joi_1.default.number().required(),
    // email: Joi.string().trim().lowercase().required(),
});
exports.creditSchema = joi_1.default.object().keys({
    email: joi_1.default.string().trim().lowercase().required(),
    amountToSend: joi_1.default.number().required(),
    status: joi_1.default.string().required(),
    transactionID: joi_1.default.string().required(),
});
exports.updateAccountSchema = joi_1.default.object().keys({
    bankName: joi_1.default.string().trim(),
    accountNumber: joi_1.default.string()
        .trim()
        .pattern(/^[0-9]+$/)
        .length(10),
    accountName: joi_1.default.string().trim(),
    walletBalance: joi_1.default.number().min(0),
});
//# sourceMappingURL=utils.js.map