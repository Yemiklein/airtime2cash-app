import express from "express";
import { sendMail } from "../controller/emailController";

const router = express.Router()

// ADD A NEW Trip
router.post('/', sendMail);

export default router
