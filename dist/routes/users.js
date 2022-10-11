"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
//Routes
router.post('/register', userController_1.registerUser);
router.get('/verify/:token', userController_1.verifyUser);
router.post('/login', userController_1.userLogin);
router.post('/forgetPassword', userController_1.forgetPassword);
router.patch('/update/:id', auth_1.auth, userController_1.updateUser);
router.patch('/resetPassword/:token', userController_1.resetPassword);
router.patch('/resendVerification', userController_1.resendVerificationLink);
router.get('/userAccount/:id', auth_1.auth, userController_1.getUserAccount);
router.get('/userTransaction/:id', auth_1.auth, userController_1.userTransactions);
router.get('/userWithdrawals/:id', auth_1.auth, userController_1.userWithdrawals);
router.get('/singleUser/:id', userController_1.singleUser);
router.get('/allUsers', adminAuth_1.adminAuth, userController_1.allUsers);
router.delete('/deleteUser/:id', adminAuth_1.adminAuth, userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.js.map