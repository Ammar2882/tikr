import mongoose from 'mongoose'

const AdminSchema = new mongoose.Schema({
    phone: {
        type: String,
        // required: true,
        index: true,
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
    name: {
        type: String,
        default: ''
    },
  
    profilePic: {
        type: String,
        default: ''
    },
    password:{
        type:String,
        required:true
    }
    
}, { timestamps: true })

export const Admin = mongoose.model('Admin', AdminSchema)