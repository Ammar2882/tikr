import Twilio from 'twilio'
import dotenv from 'dotenv'
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER

//initialize twilio client
const client = new Twilio(accountSid, authToken);

export const sendMessageSingleDevice = async(messageToSend,number)=>{
    const message = await client.messages
    .create({
       body: `This is you opt please enter this code in the app ${messageToSend}`,
       from: `${twilioNumber}`,
       to: `${number}`
     })
     if(!message.errorCode){
        return true
     }
     else{
        return false
     } 
}
