import express from 'express';
const router = express.Router();
import { adminAuth } from '../middleware/adminAuth';
import { credit } from '../controller/credit';

router.post('/credit', adminAuth, credit
)

export default router