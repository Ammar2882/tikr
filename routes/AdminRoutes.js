const express = require('express');
const router = express.Router();

//load controllers
const {addBalance, adminLogin, createBet, createUser, 
    getAllActiveBets, getAllActiveUsers, getAllAnnouncedBets, 
    getAllUsers, getBetById, getUserById, updateBalance, getWinners, dashboardNumbers, getUsersTransactionHistory} = require('../controllers/admin.controllers')
const { checkAuth } = require('../middlewares/checkAuth');

router.post('/login' , adminLogin)
router.post('/createuser',checkAuth , createUser)
router.post('/getallusers',checkAuth , getAllUsers)
router.post('/getallactiveusers',checkAuth , getAllActiveUsers)
router.post('/getuserbyid',checkAuth , getUserById)
router.post('/addbalance',checkAuth , addBalance)
router.post('/updatebalance',checkAuth , updateBalance)
router.post('/getwinners',checkAuth , getWinners)
router.post('/getdashboarddata',checkAuth , dashboardNumbers)


router.post('/createbet',checkAuth , createBet)
router.post('/getallactivebets',checkAuth , getAllActiveBets)
router.post('/getallannouncedbets',checkAuth , getAllAnnouncedBets)
router.post('/getbetbyid',checkAuth , getBetById)
router.post('/gettransactionhistory',checkAuth , getUsersTransactionHistory)

module.exports = router
