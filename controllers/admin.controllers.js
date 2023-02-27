
const { trusted } = require("mongoose")
const Admin = require("../models/Admin")
const Bet = require("../models/Bet")
const Placements = require("../models/Placements")
const User = require("../models/User.js")
const Winner = require("../models/Winner")
const { firebaseTopics } = require("../utils/firebaseTopics")
const { JWT } = require("../utils/generateJWT")
const { sendNotificationsToTopic } = require("../utils/notifications")
const { encryptPassword, verifyPassword } = require("../utils/passwordFunctions")

exports.adminLogin = async (req, res, next) => {
    try {
        const { userName, password,firebaseId } = req.body
        const admin = await Admin.findOne({ userName: userName })
        if (!admin) {
            return res.json({
                success: false,
                status: 401,
                message: "User not found",
                data: null
            })
        }
        let passwordCheck = await verifyPassword(password, admin.password)
        if (!passwordCheck) {
            return res.json({
                success: false,
                status: 401,
                message: "Wrong Password",
                data: null
            })
        }
        let updatedAdmin;
        if(firebaseId){
            subscribeToATopic(firebaseId,firebaseTopics.sendToAll)
            updatedAdmin = await User.findOneAndUpdate({_id:admin._id},{firebaseId},{new:true})
        }
        let token = await JWT( updatedAdmin ? updatedAdmin : admin)
        res.json({
            success: true,
            status: 200,
            message: "Successfully Logged In",
            data: {
                token: token,
                user: admin,
                role: 'admin',
            }
        })

    }
    catch (err) {
        console.log(err, " exception occurred")
    }
}


//bets
exports.createBet = async (req, res, next) => {
    try {
        const { gameTitle, gameType, role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const betCheck = await Bet.findOne({ gameTitle, status: 'ongoing' })
        if (betCheck) {
            return res.json({
                success: false,
                status: 401,
                message: "Bet Already Exists",
                data: null
            })
        }
        let toBeSaved = new Bet({
            gameTitle: gameTitle,
            gameType: gameType
        })
        const savedBet = await toBeSaved.save()
        if (savedBet) {
            let notification = {
                title: 'New bet online',
                body: `${savedBet.gameTitle}`
            }
            sendNotificationsToTopic(notification , firebaseTopics.sendToAll)
            return res.json({
                success: true,
                status: 200,
                message: "Bet created successfully",
                data: savedBet
            })
        }
    }
    catch (err) {
        console.log(err)
    }
}
exports.getAllActiveBets = async (req, res, next) => {
    try {
        const { role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const allActiveBets = await Bet.find({ status: 'ongoing' })
        return res.json({
            success: true,
            status: 200,
            message: "All Active Bets",
            data: allActiveBets
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}
exports.getAllAnnouncedBets = async (req, res, next) => {
    try {
        const { role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const getAllAnnouncedBets = await Bet.find({ status: 'announced' }).populate({
            path: 'winnerId',
            populate: [{
                path: 'firstPosition',
                model: 'User'
            },
            {
                path: 'secondPosition',
                model: 'User'
            },
            {
                path: 'thirdPosition',
                model: 'User'
            },
            {
                path: 'fourthPosition',
                model: 'User'
            }]
        })

        return res.json({
            success: true,
            status: 200,
            message: "All Announced Bets",
            data: getAllAnnouncedBets
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}
exports.getBetById = async (req, res, next) => {
    try {
        const { role, betId } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const singleBet = await Bet.findOne({ _id: betId })
        return res.json({
            success: true,
            status: 200,
            message: "Bet Details",
            data: singleBet
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}




exports.deleteBet = async (req, res, next) => {
    try {
        const { betId, role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const deletedBet = await Bet.deleteOne({ _id: betId })
        return res.json({
            success: true,
            status: 200,
            message: "Bet Deleted Successfully",
            data: deletedBet
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}

//     try{
//         let {betId , role} = req.body
//         if(role.toLowerCase() !== 'admin'){
//             return res.json({
//                 success:false,
//                 status:401,
//                 message:"Forbidden",
//                 data : null
//             })
//         }
//         let bet = await Bet.findOne({_id:betId})
//     }
//     catch(err){
//         console.log(err, ' :err')
//     }
// }


// users
exports.createUser = async (req, res, next) => {
    try {
        const { userName, password, userType, phone, role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const userNameCheck = await User.findOne({ userName: userName })
        if (userNameCheck) {
            return res.json({
                success: false,
                status: 401,
                message: "User Already Exists",
                data: null
            })
        }
        const hashedPassword = await encryptPassword(password)
        let newUser = new User({
            userName,
            password: hashedPassword,
            userType: userType.toLowerCase(),
            phone: phone ? phone : ''
        })
        let saveduser = await newUser.save()
        if (!saveduser) {
            return res.json({
                success: false,
                status: 500,
                message: "Server Error",
                data: null
            })
        }
        return res.json({
            success: true,
            status: 200,
            message: "user created successfully",
            data: newUser
        })

    }
    catch (err) {
        console.log(err, " :err")
    }

}
exports.getAllActiveUsers = async (req, res, next) => {
    try {
        const { role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const allActiveUsers = await User.find({ active: true })
        return res.json({
            success: true,
            status: 200,
            message: "All Active Users",
            data: allActiveUsers
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const allUsers = await User.find({})
        return res.json({
            success: true,
            status: 200,
            message: "All Users",
            data: allUsers
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}
exports.getUserById = async (req, res, next) => {
    try {
        const { role, userId } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const singleUser = await User.findOne({ _id: userId })
        return res.json({
            success: true,
            status: 200,
            message: "User Details",
            data: singleUser
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}

exports.UpdateUserById = async (req, res, next) => {
    try {
        const { role, userId, password } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const hashedPassword = await encryptPassword(password)
        const singleUser = await User.findOneAndUpdate({ _id: userId }, { password: hashedPassword })
        return res.json({
            success: true,
            status: 200,
            message: "User Details",
            data: singleUser
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}

exports.getUsersTransactionHistory = async (req, res, next) => {
    try {
        const { role, userId } = req.body
        console.log(role)
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const singleUser = await User.findOne({ _id: userId })
        return res.json({
            success: true,
            status: 200,
            message: "Transaction History",
            data: {
                transactionHistory: singleUser.balanceHistory
            }
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}

exports.addBalance = async (req, res, next) => {
    try {
        const { userId, balance, role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.json({
                success: false,
                status: 401,
                message: "No user exists by this ID",
                data: null
            })
        }
        const addBalance = await User.findOneAndUpdate(
            { _id: userId },
            { balance: (parseInt(balance) + parseInt(user.balance)), $push: { balanceHistory: { cashValue: balance, direction: 'inbound' } } },
            { new: true }
        )


        return res.json({
            success: true,
            status: 200,
            message: "Balance Added",
            data: addBalance
        })

    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.withDraw = async (req, res, next) => {
    try {
        const { userId, balance, role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.json({
                success: false,
                status: 401,
                message: "No user exists by this ID",
                data: null
            })
        }
        const addBalance = await User.findOneAndUpdate(
            { _id: userId },
            { balance: Math.abs((parseInt(user.balance) - parseInt(balance))), $push: { balanceHistory: { cashValue: balance, direction: 'outbound' } } },
            { new: true }
        )


        return res.json({
            success: true,
            status: 200,
            message: "Balance Added",
            data: addBalance
        })

    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.updateBalance = async (req, res, next) => {
    try {
        const { userId, balance, role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.json({
                success: false,
                status: 401,
                message: "No user exists by this ID",
                data: null
            })
        }
        const addBalance = await User.findOneAndUpdate(
            { _id: userId },
            { balance: balance, $push: { balanceHistory: { cashValue: balance, direction: 'inbound' } } },
            { new: true }
        )


        return res.json({
            success: true,
            status: 200,
            message: "Balance Added",
            data: addBalance
        })

    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.getWinners = async (req, res, next) => {
    try {
        const { role } = req.body
        if (role.toLowerCase() !== 'admin') {
            return res.json({
                success: false,
                status: 401,
                message: "Forbidden",
                data: null
            })
        }
        const allWinners = await Winner.find({})
        return res.json({
            success: true,
            status: 200,
            message: "All Winners",
            data: allWinners
        })
    }
    catch (err) {
        console.log(err, ' :err')
    }
}

exports.dashboardNumbers = async (req, res, next) => {
    try {
        let totalBets = await Bet.countDocuments()
        let ongoingBets = await Bet.countDocuments({ status: 'ongoing' })
        let admin = await Admin.find()
        return res.json({
            success: true,
            status: 200,
            message: "Bets",
            data: {
                totalBets,
                ongoingBets,
                admin
            }
        })
    }
    catch (e) {
        console.log(e, " err")
    }
}







