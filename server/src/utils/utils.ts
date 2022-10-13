import Joi from 'joi';
import jwt from 'jsonwebtoken';
export const sendEmail = Joi.object().keys({
  from: Joi.string(),
  to: Joi.string().required(),
  subject: Joi.string().required(),
  text: Joi.string(),
  html: Joi.string().required(),
});

export const signUpSchema = Joi.object()
  .keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().trim().lowercase().required(),
    phoneNumber: Joi.string().required(),
    avatar: Joi.string(),
    role: Joi.string(),
    walletBalance: Joi.number(),
    isVerified: Joi.boolean(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
    confirmPassword: Joi.any()
      .equal(Joi.ref('password'))
      .required()
      .label('Confirm password')
      .messages({ 'any.only': '{{#label}} does not match' }),
  })
  .with('password', 'confirmPassword');

export const updateUserSchema = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  phoneNumber: Joi.string(),
  avatar: Joi.string(),
  userName: Joi.string(),
  walletBalance: Joi.number(),
  role: Joi.string(),
});

export const loginSchema = Joi.object().keys({
  emailOrUsername: Joi.string().trim().lowercase().required(),
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

export const resetPasswordSchema = Joi.object()
  .keys({
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    confirmPassword: Joi.any()
      .equal(Joi.ref('password'))
      .required()
      .label('Confirm password')
      .messages({ 'any.only': '{{#label}} does not match' }),
  })
  .with('password', 'confirmPassword');

export const options = {
  abortEarly: false,
  errors: {
    wrap: {
      label: '',
    },
  },
};

export const generateToken = (user: { [key: string]: unknown }): unknown => {
  const pass = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_DURATION as string;
  return jwt.sign(user, pass, { expiresIn });
};

export const createAccountSchema = Joi.object().keys({
  bankName: Joi.string().trim().required(),
  accountNumber: Joi.string()
    .trim()
    .required()
    .pattern(/^[0-9]+$/)
    .length(10),
  accountName: Joi.string().trim().required(),
});
export const withdrawSchema = Joi.object().keys({
  amount: Joi.number().required(),
  accountNumber: Joi.string()
    .trim()
    .required()
    .pattern(/^[0-9]+$/)
    .length(10),
  bank: Joi.string().trim().required(),
  accountName: Joi.string().trim().required(),
  otp: Joi.number().required(),
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
});

export const postAirTimeSchema = Joi.object().keys({
  network: Joi.string().required(),
  phoneNumber: Joi.string()
    .trim()
    .required()
    .pattern(/^[0-9]+$/)
    .length(11),
  amountToSell: Joi.number().required(),
  sharePin: Joi.string()
    .trim()
    .required()
    .pattern(/^[0-9]+$/)
    .length(4),
  amountToReceive: Joi.number().required(),
  // email: Joi.string().trim().lowercase().required(),
});

export const creditSchema = Joi.object().keys({
  email: Joi.string().trim().lowercase().required(),
  amountToSend: Joi.number().required(),
  amountReceived: Joi.number().required(),
  otp: Joi.number().required(),
  status: Joi.string().required(),
  transactionID: Joi.string().required(),
});

export const updateAccountSchema = Joi.object().keys({
  bankName: Joi.string().trim(),
  accountNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]+$/)
    .length(10),
  accountName: Joi.string().trim(),
  walletBalance: Joi.number().min(0),
});

export const generateOtp = Joi.object().keys({
  purpose: Joi.string().required()
});


