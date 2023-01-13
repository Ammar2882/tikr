
import {User} from "../models/User"
import { JWT } from "../utils/generateJWT"
import { Bet } from "../models/Bet"
import Placements from "../models/Placements"
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


export const userLogin =async(req,res,next)=>{
    try{
        const {number , password} = req.body
        const user = await User.findOne({number , password})
        if(!admin){
             return res.json({
                success:false,
                status:401,
                message:"Wrong credentials",
                data : null
             })
        }
        let token = JWT(user)
        res.json({
            success:true,
            status:200,
            message:"Successfully Logged In",
            data:{
                token:token,
                user:user,
                role:'user',
            }
        })
  
    }
    catch(err){
        console.log(err , " :err")
    }
}

export const placeBet = async(req,res,next)=>{
    try{
        const {numbers , userId , betId} = req.body
        if(numbers.length>0 && userId && betId){
            const bet = await Bet.findOne({_id:betId , status:'ongoing'})
            if(!bet){
                return res.json({
                    success:false,
                    status:400,
                    message:"No bet found",
                    data:null
                })
            }
            const user = await User.findOne({_id:userId})
            if(user.balance < parseInt(bet.gameType)){
                return res.json({
                    success:false,
                    status:400,
                    message:"Not enough balance",
                    data:null
                })
            }
            let spotsRemaining = ((bet.totalSpots) - (bet.spotsTaken.length))
            if(spotsRemaining > 0){
                for(let i = 0; i<numbers.length ; i++){
                    if(bet.spotsTaken.includes(numbers[i])){
                        return res.json({
                            success:false,
                            status:400,
                            message:`${numbers[i]} is taken`,
                            data:null
                        })
                    }
                }
                const alreadyPresent = await Placements.findOne({userId , betId})
                let placedBet;
                if(!alreadyPresent){
                    const toBePlaced = new Placements({
                        userId,
                        betId,
                        numbers
                    })
                    placedBet = await toBePlaced.save()
                }
                else{
                    placedBet = await Placements.findOneAndUpdate({_id:alreadyPresent._id},{$push: {numbers: {$each: numbers}}})  
                }
              
                const updatedBet = await Bet.findOneAndUpdate({_id : bet._id},{$push: {spotsTaken: {$each: numbers}} , $pullAll: { spotsLeft: numbers } })
                const cutUserBalance = await User.findOneAndUpdate({_id:userId},{balance:(user.balance - bet.gameType)})
                if(updatedBet && placedBet && cutUserBalance){
                    return res.json({
                        success:true,
                        status:200,
                        message:"Bet Placed Successfully",
                        data:null
                    })
                }
            }
        }
        else{
            return res.json({
             success:false,
             status:422,
             message:"data missing",
             data:null
            })
        }
    }
    catch(err){
        console.log(err , " :err")
    }
}