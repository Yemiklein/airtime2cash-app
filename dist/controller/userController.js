"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userWithdrawals = exports.userTransactions = exports.getUserAccount = exports.deleteUser = exports.allUsers = exports.singleUser = exports.userLogout = exports.resetPassword = exports.forgetPassword = exports.userLogin = exports.updateUser = exports.resendVerificationLink = exports.verifyUser = exports.registerUser = void 0;
const uuid_1 = require("uuid");
const utils_1 = require("../utils/utils");
const userModel_1 = require("../model/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailController_1 = require("./emailController");
const cloudinary_1 = __importDefault(require("cloudinary"));
const accounts_1 = require("../model/accounts");
const sellAirtimeModel_1 = require("../model/sellAirtimeModel");
const withdrawalHistory_1 = require("../model/withdrawalHistory");
async function registerUser(req, res, next) {
    try {
        const id = (0, uuid_1.v4)();
        const validationResult = utils_1.signUpSchema.validate(req.body, utils_1.options);
        if (validationResult.error) {
            return res.status(400).json({
                Error: validationResult.error.details[0].message,
            });
        }
        const duplicateEmail = await userModel_1.userInstance.findOne({ where: { email: req.body.email } });
        if (duplicateEmail) {
            return res.status(409).json({
                message: 'Email is used, please change email',
            });
        }
        const duplicateUsername = await userModel_1.userInstance.findOne({ where: { userName: req.body.userName } });
        if (duplicateUsername) {
            return res.status(409).json({
                message: 'Username is used, please change username',
            });
        }
        const duplicatePhone = await userModel_1.userInstance.findOne({ where: { phoneNumber: req.body.phoneNumber } });
        if (duplicatePhone) {
            return res.status(409).json({
                message: 'Phone number is used, please change phone number',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 10);
        const token = (0, uuid_1.v4)();
        const record = await userModel_1.userInstance.create({
            id: id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: passwordHash,
            avatar: req.body.avatar,
            isVerified: req.body.isVerified,
            token,
            role: req.body.role || 'user',
        });
        const link = `${process.env.BACKEND_URL}/user/verify/${token}`;
        const emailData = {
            to: req.body.email,
            subject: 'Verify Email',
            html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
            margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="color: teal;">Welcome To Airtime to Cash</h2>
            <p>Please Follow the link by clicking on the button to verify your email
             </p>
             <div style='text-align:center ;'>
               <a href=${link}
              style="background: #277BC0; text-decoration: none; color: white;
               padding: 10px 20px; margin: 10px 0;
              display: inline-block;">Click here</a>
             </div>
          </div>`,
        };
        (0, emailController_1.emailTemplate)(emailData);
        return res.status(201).json({
            message: 'Successfully created a user',
            record: {
                id: record.id,
                userName: record.userName,
                phoneNumber: record.phoneNumber,
                email: record.email,
                avatar: record.avatar,
                isVerified: record.isVerified,
                token: record.token,
                walletBalance: record.walletBalance
            },
        });
    }
    catch (err) {
        return res.status(500).json({
            message: 'failed to register',
            route: '/register',
        });
    }
}
exports.registerUser = registerUser;
async function verifyUser(req, res, next) {
    try {
        const { token } = req.params;
        const user = await userModel_1.userInstance.findOne({ where: { token } });
        if (!user) {
            return res.status(404).redirect(`${process.env.FRONTEND_URL}/${token}`);
            // .json({
            //   message: 'User not found',
            // });
        }
        const verifiedUser = await userModel_1.userInstance.update({ isVerified: true, token: 'null' }, { where: { token } });
        if (verifiedUser) {
            // console.log(verifiedUser)
            const updatedDetails = await userModel_1.userInstance.findOne({ where: { id: user.id } });
            return res.status(200).redirect(`${process.env.FRONTEND_URL}/login`);
            // .json({
            //   message: 'Email verified successfully',
            //   record: {
            //     email: user.email,
            //     isVerified: updatedDetails?.isVerified,
            //   },
            // })
        }
    }
    catch (err) {
        return res.status(500).json({
            message: 'failed to verify user',
            route: '/verify/:id',
        });
    }
}
exports.verifyUser = verifyUser;
async function resendVerificationLink(req, res, next) {
    try {
        const { email } = req.body;
        const user = await userModel_1.userInstance.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }
        if (user.isVerified) {
            return res.status(409).json({
                message: 'Email already verified',
            });
        }
        const token = (0, uuid_1.v4)();
        const updatedUser = await userModel_1.userInstance.update({ token }, { where: { email } });
        if (updatedUser) {
            const link = `${process.env.BACKEND_URL}/user/verify/${token}`;
            const emailData = {
                to: email,
                subject: 'Verify Email',
                html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
            margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="color: teal;">Welcome To Airtime to Cash</h2>
            <p>Please Follow the link by clicking on the button to verify your email
              </p>
              <div style='text-align:center ;'>
                <a href=${link}
                style="background: #277BC0; text-decoration: none; color: white;
                padding: 10px 20px; margin: 10px 0;
                display: inline-block;">Click here</a>
              </div>
          </div>`,
            };
            (0, emailController_1.emailTemplate)(emailData)
                .then((email_response) => {
                return res.status(200).json({
                    message: 'Verification link sent successfully',
                    token,
                    email_response,
                });
            })
                .catch((err) => {
                res.status(500).json({
                    message: 'Server error',
                    err,
                });
            });
            // return res.status(200).json({
            //   message: 'Verification link sent successfully',
            // });
        }
    }
    catch (err) {
        return res.status(500).json({
            message: 'failed to resend verification link',
            route: '/resend-verification-link',
        });
    }
}
exports.resendVerificationLink = resendVerificationLink;
async function updateUser(req, res, next) {
    try {
        cloudinary_1.default.v2.config({
            cloudName: process.env.CLOUDINARY_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
        });
        const { id } = req.params;
        const record = await userModel_1.userInstance.findOne({ where: { id } });
        const { firstName, avatar, userName, lastName, phoneNumber } = req.body;
        const validationResult = utils_1.updateUserSchema.validate(req.body, utils_1.options);
        if (validationResult.error) {
            return res.status(400).json({
                Error: validationResult.error.details[0].message,
            });
        }
        if (!record) {
            return res.status(404).json({
                message: 'cannot find user',
            });
        }
        let result = {};
        if (req.body.avatar) {
            result = await cloudinary_1.default.v2.uploader.upload(req.body.avatar, {
                //formats allowed for download
                allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
                //generates a new id for each uploaded image
                public_id: '',
                //fold where the images are stored
                folder: 'live-project-podf',
            });
            if (!result) {
                throw new Error('Image is not a valid format. Only jpg, png, svg and jpeg allowed');
            }
        }
        const updatedRecord = await (record === null || record === void 0 ? void 0 : record.update({
            firstName,
            userName,
            lastName,
            phoneNumber,
            avatar: result === null || result === void 0 ? void 0 : result.url,
            role: req.body.role || 'user',
        }));
        return res.status(202).json({
            message: 'successfully updated user details',
            updatedRecord,
        });
    }
    catch (err) {
        return res.status(500).json({ message: 'failed to update user details, check image format', err });
    }
}
exports.updateUser = updateUser;
async function userLogin(req, res, next) {
    try {
        const { emailOrUsername, password } = req.body;
        const validate = utils_1.loginSchema.validate(req.body, utils_1.options);
        if (validate.error) {
            return res.status(401).json({ Error: validate.error.details[0].message });
        }
        let validUser = (await userModel_1.userInstance.findOne({ where: { email: emailOrUsername } }));
        if (!validUser) {
            validUser = (await userModel_1.userInstance.findOne({ where: { userName: emailOrUsername } }));
        }
        if (!validUser) {
            return res.status(401).json({ message: 'User is not registered' });
        }
        const { id } = validUser;
        const token = (0, utils_1.generateToken)({ id });
        const validatedUser = await bcryptjs_1.default.compare(req.body.password, validUser.password);
        if (!validatedUser) {
            return res.status(401).json({ message: 'failed to login, wrong user name/password inputed' });
        }
        if (validUser.isVerified && validatedUser) {
            return res
                .cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            })
                .status(200)
                .json({
                message: 'Successfully logged in',
                id,
                token,
                user_info: {
                    firstName: `${validUser.firstName} `,
                    lastName: `${validUser.lastName}`,
                    phoneNumber: `${validUser.phoneNumber}`,
                    userName: `${validUser.userName}`,
                    email: `${validUser.email}`,
                    walletBalance: `${validUser.walletBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
                    avatar: `${validUser.avatar}`,
                    role: `${validUser.role}`,
                },
            });
        }
        return res.status(401).json({ message: 'Please verify your email' });
    }
    catch (error) {
        return res.status(500).json({ message: 'failed to login', route: '/login' });
    }
}
exports.userLogin = userLogin;
async function forgetPassword(req, res, next) {
    try {
        const { email } = req.body;
        const user = await userModel_1.userInstance.findOne({ where: { email } });
        if (!user) {
            return res.status(409).json({
                message: 'User not found',
            });
        }
        const token = (0, uuid_1.v4)();
        const resetPasswordToken = await userModel_1.userInstance.update({ token }, { where: { email } });
        const link = `${process.env.FRONTEND_URL}/resetpassword/${token}`;
        const emailData = {
            to: email,
            subject: 'Password Reset',
            html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
            margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="color: teal;">Welcome To Airtime to Cash</h2>
            <p>Please Follow the link by clicking on the button to change your password
             </p>
             <div style='text-align:center ;'>
               <a href=${link}
              style="background: #277BC0; text-decoration: none; color: white;
               padding: 10px 20px; margin: 10px 0;
              display: inline-block;">Click here</a>
             </div>
          </div>`,
        };
        (0, emailController_1.emailTemplate)(emailData)
            .then((email_response) => {
            return res.status(200).json({
                message: 'Reset password token sent to your email',
                token,
                email_response,
            });
        })
            .catch((err) => {
            res.status(500).json({
                message: 'Server error',
                err,
            });
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'failed to send reset password token',
            route: '/forgetPassword',
        });
    }
}
exports.forgetPassword = forgetPassword;
async function resetPassword(req, res, next) {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const validate = utils_1.resetPasswordSchema.validate(req.body, utils_1.options);
        if (validate.error) {
            return res.status(400).json({ Error: validate.error.details[0].message });
        }
        const user = await userModel_1.userInstance.findOne({ where: { token } });
        if (!user) {
            return res.status(404).json({
                message: 'Invalid Token',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const resetPassword = await userModel_1.userInstance.update({ password: passwordHash, token: 'null' }, { where: { token } });
        return res.status(202).json({
            message: 'Password reset successfully',
            resetPassword,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: 'failed to reset password',
            route: '/resetPassword',
        });
    }
}
exports.resetPassword = resetPassword;
async function userLogout(req, res, next) {
    try {
        res.cookie('jwt', '', { maxAge: 1 });
        return res.status(200).json({ message: 'logged out successfully' });
    }
    catch (err) {
        return res.status(500).json({ message: 'failed to logout' });
    }
}
exports.userLogout = userLogout;
async function singleUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await userModel_1.userInstance.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User found', user });
    }
    catch (err) {
        return res.status(500).json({ message: 'failed to get user' });
    }
}
exports.singleUser = singleUser;
async function allUsers(req, res, next) {
    try {
        const users = await userModel_1.userInstance.findAll({
            where: {
                role: "user"
            }
        });
        if (!users) {
            return res.status(404).json({ message: 'No user found' });
        }
        return res.status(200).json({ message: 'Users found', users });
    }
    catch (err) {
        return res.status(500).json({ message: 'failed to get users' });
    }
}
exports.allUsers = allUsers;
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await userModel_1.userInstance.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const deletedUser = await userModel_1.userInstance.destroy({ where: { id } });
        return res.status(200).json({ message: 'User deleted', deletedUser });
    }
    catch (err) {
        return res.status(500).json({ message: 'failed to delete user' });
    }
}
exports.deleteUser = deleteUser;
async function getUserAccount(req, res, next) {
    try {
        const { id } = req.params;
        const record = await userModel_1.userInstance.findAll({
            where: { id },
            include: [
                {
                    model: accounts_1.AccountInstance,
                    as: 'accounts',
                },
            ],
        });
        return res.status(200).json({
            status: 'success',
            message: 'Account retrieved successfully',
            data: record[0].accounts,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error,
        });
    }
}
exports.getUserAccount = getUserAccount;
async function userTransactions(req, res, next) {
    try {
        const { id } = req.params;
        const record = await userModel_1.userInstance.findAll({
            where: { id },
            include: [
                {
                    model: sellAirtimeModel_1.SellAirtimeInstance,
                    as: 'SellAirtime',
                },
            ],
            order: [[{ model: sellAirtimeModel_1.SellAirtimeInstance, as: 'SellAirtime' }, 'createdAt', 'DESC']],
        });
        return res.status(200).json({
            status: 'success',
            message: 'Transactions retrieved successfully',
            data: record[0].SellAirtime,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error,
        });
    }
}
exports.userTransactions = userTransactions;
async function userWithdrawals(req, res, next) {
    try {
        const { id } = req.params;
        const record = await userModel_1.userInstance.findAll({
            where: { id },
            include: [
                {
                    model: withdrawalHistory_1.WithdrawHistoryInstance,
                    as: 'withdrawBalance',
                },
            ],
            order: [[{ model: withdrawalHistory_1.WithdrawHistoryInstance, as: 'withdrawBalance' }, 'createdAt', 'DESC']],
        });
        return res.status(200).json({
            status: 'success',
            message: 'Withdrawals retrieved successfully',
            data: record[0].withdrawBalance,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error,
        });
    }
}
exports.userWithdrawals = userWithdrawals;
//# sourceMappingURL=userController.js.map