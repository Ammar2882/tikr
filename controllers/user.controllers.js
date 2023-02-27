
const User = require("../models/User")
const { JWT } = require("../utils/generateJWT")
const Bet = require("../models/Bet")
const Placements = require("../models/Placements")
const { verifyPassword } = require("../utils/passwordFunctions")
const Winner = require("../models/Winner")
const { subscribeToATopic } = require("../utils/notifications")
const { firebaseTopics } = require("../utils/firebaseTopics")
// const sendOtp = async (req, res, next) => {
//     try {
//         const body = req.body
//         let otp = Math.floor(1000 + Math.random() * 9000)
//         const user = {
//             phone: body.number,
//             otp: `${otp}`
//         }
//         const saved = await User.findOneAndUpdate({ phone: body.number }, user, { upsert: true, new: true })
//         const messageRes = await sendMessageSingleDevice(otp, body.number)
//         if (messageRes && saved) {
//             SuccessResponse(res, true, 'otp', otp)
//         }

//     }
//     catch (e) {
//         next(new ErrorResponse(400, e))
//     }
// }
// const otpVerification = async (req, res, next) => {
//     try {
//         const body = req.body
//         const user = await User.findOne({phone:body?.number})
//         if(!user){
//              return SuccessResponse(res,false,"no user exists by this number",null)
//         }
//             if(user.otp){
//                 if(user.otp === `${body.otp}`){
//                 const userName = UserNameGenerator()
//                   const saved = await User.findOneAndUpdate({phone:body.number},{otp:"####" , user_name:userName},{new:true})
//                   if(saved){
//                     const token=JWT(saved)
//                     let user={
//                         user:saved,
//                         token:token
//                     }
//                    return SuccessResponse(res,true,"signed up successfully",user)
//                   }
//                 }
//                 else{
//                    return SuccessResponse(res,false,"OTP does not match",null)
//                 }
//             }
//         }
//     catch (e) {
//         console.log(e)
//         return next(new ErrorResponse())
//     }
// }


exports.userLogin = async (req, res, next) => {
    try {
        const { userName, password,firebaseId } = req.body
        console.log(firebaseId)
        const user = await User.findOne({ userName: userName })
        if (!user) {
            return res.json({
                success: false,
                status: 401,
                message: "User not found",
                data: null
            })
        }
        let passwordCheck = await verifyPassword(password, user.password)
        if (!passwordCheck) {
            return res.json({
                success: false,
                status: 401,
                message: "Wrong Password",
                data: null
            })
        }
        let updatedUser;
        if(firebaseId){
            subscribeToATopic(firebaseId,firebaseTopics.sendToAll)
            updatedUser = await User.findOneAndUpdate({_id:user._id},{firebaseId},{new:true})
        }
        let token = await JWT(updatedUser ? updatedUser:user)
        res.json({
            success: true,
            status: 200,
            message: "Successfully Logged In",
            data: {
                token: token,
                user: updatedUser,
                role: 'user',
            }
        })

    }
    catch (err) {
        console.log(err, " exception occurred")
    }
}

exports.placeBet = async (req, res, next) => {
    try {
        const { numbers, userId, betId } = req.body
        if (numbers.length > 0 && userId && betId) {
            const bet = await Bet.findOne({ _id: betId, status: 'ongoing' })
            if (!bet) {
                return res.json({
                    success: false,
                    status: 400,
                    message: "No bet found",
                    data: null
                })
            }
            const user = await User.findOne({ _id: userId })
            if (user.balance < parseInt(bet.gameType)) {
                return res.json({
                    success: false,
                    status: 400,
                    message: "Not enough balance",
                    data: null
                })
            }
            let spotsRemaining = ((bet.totalSpots) - (bet.spotsTaken.length))
            if (spotsRemaining > 0) {
                for (let i = 0; i < numbers.length; i++) {
                    if (bet.spotsTaken.includes(numbers[i])) {
                        return res.json({
                            success: false,
                            status: 400,
                            message: `${numbers[i]} is taken`,
                            data: null
                        })
                    }
                }
                const alreadyPresent = await Placements.findOne({ userId, betId })
                let placedBet;
                if (!alreadyPresent) {
                    const toBePlaced = new Placements({
                        userId,
                        betId,
                        numbers
                    })
                    placedBet = await toBePlaced.save()
                }
                else {
                    placedBet = await Placements.findOneAndUpdate({ _id: alreadyPresent._id }, { $push: { numbers: { $each: numbers } } })
                }

                const updatedBet = await Bet.findOneAndUpdate({ _id: bet._id }, { $push: { spotsTaken: { $each: numbers } }, $pullAll: { spotsLeft: numbers } })
                const cutUserBalance = await User.findOneAndUpdate({ _id: userId }, { balance: (user.balance - bet.gameType), $push: { balanceHistory: { cashValue: bet.gameType, direction: 'outbound' } } })
                if (updatedBet && placedBet && cutUserBalance) {
                    return res.json({
                        success: true,
                        status: 200,
                        message: "Bet Placed Successfully",
                        data: null
                    })
                }
            }
        }
        else {
            return res.json({
                success: false,
                status: 422,
                message: "data missing",
                data: null
            })
        }
    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.userBets = async (req, res, next) => {
    try {
        const { userId } = req.body
        let userBets = await Placements.find({ userId }).lean().populate('betId')
        if (userBets.length > 0) {
            let activeBets = []
            let announcedBets = []
            for (let i = 0; i < userBets.length; i++) {
                if (userBets[i].betId.status === 'ongoing') {
                    userBets[i].betId.numbers = userBets[i].numbers
                    activeBets.push(userBets[i].betId)
                }
                else {
                    userBets[i].betId.numbers = userBets[i].numbers
                    announcedBets.push(userBets[i].betId)
                }
            }
            return res.json({
                success: true,
                status: 200,
                message: "User Bets",
                data: {
                    activeBets,
                    announcedBets
                }
            })
        }
        else {
            return res.json({
                success: false,
                status: 400,
                message: "No bets found",
                data: null
            })
        }
    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.drawingSoonBets = async (req, res, next) => {
    try {
        let drawingSoonBets = await Bet.find({ status: 'ongoing', 'spotsTaken.79': { $exists: true } })
        return res.json({
            success: true,
            status: 200,
            message: "Drawing soon bets",
            data: { drawingSoonBets }
        })
    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.latestResults = async (req, res, next) => {
    try {
        let fromDate = new Date()
        fromDate = new Date(fromDate.setHours(fromDate.getHours() - 12))
        let filters = {
            status: 'announced',
            updatedAt: { $gte: fromDate }
        }
        let latestResults = await Bet.find(filters)
        return res.json({
            success: true,
            status: 200,
            message: "Latest Results",
            data: { latestResults }
        })
    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.getMyWinnings = async (req, res, next) => {
    try {
        let { userId } = req.body
        let fromDate = new Date()
        fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
        let filters = {
            $or: [
                { firstPosition: userId },
                { secondPosition: userId },
                { thirdPosition: userId },
                { fourthPosition: userId },
            ]
        }
        let myPrizes = await Winner.find(filters).lean().populate(
            {
                path: 'betId',
                model: 'Bet',
                select: { 'gameTitle': 1, 'winningNumbers': 1 },
            },

        )
        if (myPrizes.length > 0) {
            let finalArr = []
            for (let i = 0; i < myPrizes.length; i++) {
                let winningObj = {}
                let placement = await Placements.findOne({ betId: myPrizes[i].betId._id, userId: userId }, { _id: 0, numbers: 1 }).lean()
                let winningPositions = []
                for (j = 0; j < placement.numbers.length; j++) {
                    if (myPrizes[i].betId.winningNumbers.includes(placement.numbers[j])) winningPositions.push(placement.numbers[j])
                }
                winningObj.placement = winningPositions
                winningObj.bet = myPrizes[i].betId
                finalArr.push(winningObj)
            }
            return res.json({
                success: true,
                status: 200,
                message: "Prizes",
                data: { myPrizes: finalArr }
            })
        }
        else {
            return res.json({
                success: true,
                status: 400,
                message: "No bets Found",
                data: null
            })
        }
    }
    catch (err) {
        console.log(err, " :err")
    }
}

exports.getBetByIdFormatted = async (req, res, next) => {
    try {
        const { role, betId } = req.body
        const singleBet = await Bet.findOne({ _id: betId, status: 'ongoing' }).lean()
        if (!singleBet) {
            return res.json(
                {
                    status: 404,
                    success: false,
                    message: "Bet not found",
                    data: null
                }

            )
        }
        let allNumbers = []
        for (let i = 1; i < 101; i++) {
            let obj = {}
            if (!singleBet.spotsLeft.includes(i)) {
                obj.value = i,
                    obj.available = false
            }
            else {
                obj.value = i,
                    obj.available = true
            }
            allNumbers.push(obj)
        }
        singleBet.allNumbers = allNumbers
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
