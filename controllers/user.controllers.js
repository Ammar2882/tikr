import { ErrorResponse } from "../utils/responseTempletes"
import { SuccessResponse } from "../utils/responseTempletes"
import { sendMessageSingleDevice } from "../utils/twilio"
import User from "../models/User"
import { UserNameGenerator } from "../utils/userNameGenerator"
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
        const body = req.body
        const user = await User.findOne({phone:body.number})
        if(!user){
            SuccessResponse(res,false,"no user exists by this number",null)
        }
            if(user.otp){
                if(user.otp === `${body.otp}`){
                const userName = UserNameGenerator()
                  const saved = await User.findOneAndUpdate({phone:body.number},{otp:"####" , user_name:userName},{new:true})
                  if(saved){
                    SuccessResponse(res,true,"signed up successfully",saved)
                  }
                }
                else{
                    SuccessResponse(res,false,"OTP does not match",null)
                }
            }
        }
    catch (e) {
        next(new ErrorResponse(400, e))
    }
}
export { sendOtp,otpVerification }