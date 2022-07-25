import { ErrorResponse } from "../utils/responseTempletes"
import { SuccessResponse } from "../utils/responseTempletes"
import { sendMessageSingleDevice } from "../utils/twilio"
import User from "../models/User"
import { UserNameGenerator } from "../utils/userNameGenerator"
import { JWT } from "../utils/generateJWT"
const sendOtp = async (req, res, next) => {
    try {
        const body = req.body
        let otp = Math.floor(1000 + Math.random() * 9000)
        const user = {
            phone: body.number,
            otp: `${otp}`
        }
        const saved = await User.findOneAndUpdate({ phone: body.number }, user, { upsert: true, new: true })
        const messageRes = await sendMessageSingleDevice(otp, body.number)
        if (messageRes && saved) {
            SuccessResponse(res, true, 'otp', otp)
        }

    }
    catch (e) {
        next(new ErrorResponse(400, e))
    }
}
const otpVerification = async (req, res, next) => {
    try {
console.log(req.body , "body")
        const body = req.body
        const user = await User.findOne({phone:body?.number})
        console.log(user , "user found")
        if(!user){
             return SuccessResponse(res,false,"no user exists by this number",null)
        }
            if(user.otp){
                if(user.otp === `${body.otp}`){
                const userName = UserNameGenerator()
                  const saved = await User.findOneAndUpdate({phone:body.number},{otp:"####" , user_name:userName},{new:true})
                  if(saved){
                    const token=JWT(saved)
                    let user={
                        user:saved,
                        token:token
                    }
                   return SuccessResponse(res,true,"signed up successfully",user)
                  }
                }
                else{
                   return SuccessResponse(res,false,"OTP does not match",null)
                }
            }
        }
    catch (e) {
        console.log(e)
        return next(new ErrorResponse())
    }
}
export { sendOtp,otpVerification }