import express from 'express';
import { placeBet } from '../controllers/user.controllers';
import { checkAuth } from '../middlewares/checkAuth';
const router = express.Router();

//load controllers
// import {otpVerification, sendOtp} from '../controllers/user.controllers'

router.post('/otprequest',()=>{
    console.log('q')
})
router.post('/otpverification',()=>{
    console.log('q')
}) 

router.post('/placebet',checkAuth,placeBet) 

export default router
