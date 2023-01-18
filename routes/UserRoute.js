const express = require('express');
const { placeBet } = require('../controllers/user.controllers');
const { checkAuth } = require('../middlewares/checkAuth');
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

module.exports = router
