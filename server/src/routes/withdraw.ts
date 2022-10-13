import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth';
import { withdraw, getTransactions } from '../controller/withdraw';
import { otpValidate } from '../middleware/otpValidate';

router.post('/withdraw', auth, otpValidate, withdraw);
router.get('/gettransactions', auth, getTransactions);

export default router;
