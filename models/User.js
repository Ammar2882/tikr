
const mongoose = require('mongoose')
const TransactionSchema = new mongoose.Schema({
    cashValue:String,
    direction:String
}, { timestamps: true })

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        default:''
    },
    userName:{
        type:String,
        required:true,
        unique: [true, "this user name already exists"],
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
    balanceHistory:{
        type:[TransactionSchema],
        default:[],
    },
    firebaseId:{
        type:String,
        default:""
    }
}, { timestamps: true })




module.exports =  mongoose.model('User', UserSchema)