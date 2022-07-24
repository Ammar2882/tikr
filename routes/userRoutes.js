import express from 'express';
const router = express.Router();

//load controllers
import {otpVerification, sendOtp} from '../controllers/user.controllers'

router.post('/otprequest',sendOtp)
router.post('/otpverification',otpVerification) 

export default router
