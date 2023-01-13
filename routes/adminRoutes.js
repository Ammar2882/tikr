import express from 'express';
const router = express.Router();

//load controllers
import {addBalance, adminLogin, createBet, createUser, getAllActiveBets, getAllActiveUsers, getAllAnnouncedBets, getAllUsers, getBetById, getUserById} from '../controllers/admin.controllers'
import { checkAuth } from '../middlewares/checkAuth';

router.post('/login' , adminLogin)
router.post('/createuser',checkAuth , createUser)
router.post('/getallusers',checkAuth , getAllUsers)
router.post('/getallactiveusers',checkAuth , getAllActiveUsers)
router.post('/getuserbyid',checkAuth , getUserById)
router.post('/addbalance',checkAuth , addBalance)


router.post('/createbet',checkAuth , createBet)
router.post('/getallactivebets',checkAuth , getAllActiveBets)
router.post('/getallannouncedbets',checkAuth , getAllAnnouncedBets)
router.post('/getbetbyid',checkAuth , getBetById)

export default router
