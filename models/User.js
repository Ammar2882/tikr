
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        required:true,
        index: true,
        unique: [true, "this number already exists"],
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    userType:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        default:'',
        type:String,
    },
    active:{
        type:Boolean,
        default:true
    },
    balance:{
        default:0,
        type:Number
    },
   

}, { timestamps: true })

export const User =  mongoose.model('User', UserSchema)