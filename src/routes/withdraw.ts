import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth';
import { withdraw, getTransactions } from '../controller/withdraw';

router.post('/withdraw', auth, withdraw);
router.get('/gettransactions', auth, getTransactions);

export default router;
