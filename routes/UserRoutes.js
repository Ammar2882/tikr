const express = require('express');
const { placeBet , userBets, drawingSoonBets, latestResults,  userLogin, getMyWinnings} = require('../controllers/user.controllers');
const { checkAuth } = require('../middlewares/checkAuth');
const router = express.Router();

router.post('/otprequest',()=>{
    console.log('q')
})
router.post('/otpverification',()=>{
    console.log('q')
}) 
router.post('/login',userLogin) 

router.post('/placebet',checkAuth,placeBet) 
router.post('/userbets',checkAuth,userBets) 
router.post('/drawingsoonbets',checkAuth,drawingSoonBets) 
router.post('/latestresults',checkAuth,latestResults) 
router.post('/myprizes',checkAuth,getMyWinnings) 

module.exports = router
