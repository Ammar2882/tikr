const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    phone: {
        type: String,
        // required: true,
        unique: [true, "this number already exists"],
        match: [
            /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/,
            'Please add a valid phone number.'
        ]
    },
    email: {
        type: String,
        // required:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            `please enter a valid Email!`
        ]

    },
    userName: {
        type: String,
        required:true
    },
  
    profilePic: {
        type: String,
        default: ''
    },
    password:{
        type:String,
        required:true
    },
    totalEarned:{
        type:Number,
        default:0
    },
    totalSpent:{
        type:Number,
        default:0
    }
    
}, { timestamps: true })

module.exports= mongoose.model('Admin', AdminSchema)