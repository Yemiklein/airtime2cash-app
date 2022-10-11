"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
const userModel_1 = require("../model/userModel");
async function adminAuth(req, res, next) {
    try {
        const authorization = req.headers.authorization.split(' ')[1];
        if (!authorization) {
            res.status(401).json({
                Error: 'Kindly sign in as a user',
            });
        }
        const token = authorization;
        let verified = jsonwebtoken_1.default.verify(token, secret);
        if (!verified) {
            return res.status(401).json({
                Error: 'User not verified, you cant access this route',
            });
        }
        const { id } = verified;
        const user = await userModel_1.userInstance.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({
                Error: 'User not verified',
            });
        }
        if (user.role !== 'admin') {
            return res.status(401).json({
                Error: 'You are not authorized to access this route',
            });
        }
        req.user = verified;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(403).json({
            Error: 'User not logged in',
        });
    }
}
exports.adminAuth = adminAuth;
//# sourceMappingURL=adminAuth.js.map