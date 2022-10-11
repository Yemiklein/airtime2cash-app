import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth';
import { postSellAirtime, allTransactions, pendingTransactions } from '../controller/sellAirtime';
import { adminAuth } from '../middleware/adminAuth';

router.post('/sellairtime', auth, postSellAirtime);
router.get('/alltransactions', adminAuth, allTransactions);
router.get('/pendingTransactions', adminAuth, pendingTransactions);

export default router;
