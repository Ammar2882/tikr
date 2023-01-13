import express from 'express';
import { placeBet } from '../controllers/user.controllers';
const router = express.Router();

//load controllers
// import {otpVerification, sendOtp} from '../controllers/user.controllers'

router.post('/otprequest',()=>{
    console.log('q')
})
router.post('/otpverification',()=>{
    console.log('q')
}) 

router.post('/placebet',placeBet) 

export default router
