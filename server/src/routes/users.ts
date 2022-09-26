import express from 'express';
import {
  registerUser,
  updateUser,
  forgetPassword,
  resetPassword,
  userLogin,
  verifyUser,
  singleUser,
  allUsers,
  resendVerificationLink,
  getUserAccount
} from '../controller/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

//Routes
router.post('/register', registerUser);
router.get('/verify/:token', verifyUser);
router.post('/login', userLogin);
router.post('/forgetPassword', forgetPassword);
router.patch('/update/:id', auth, updateUser);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/resendVerification',resendVerificationLink)
router.get('/userAccount/:id', getUserAccount);

router.get('/singleUser/:id', singleUser);
router.get('/allUsers', allUsers);
export default router;
