// phone, (would be taken on first signup/login)
// username, (random alphanumeric name like adis_10000) (Format = abcdefg_10000) 
// profile_pic (initially it’ll be a blank emoji)
// referal_username (same as the username)
// email (initially it'll be blank)
// name (initially it'll be blank)
// birthday (initially it'll be blank)
// state (initially it'll be blank)
// datetime (timestamp when user had logged in first) (unix timestamp)

import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        index: true,
        unique: [true, "this number already exists"],
        match: [
            /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/,
            'Please add a valid phone number.'
        ]
    },
    email: {
        type: String,
        default: '',
        index: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            `please enter a valid Email!`
        ]

    },
    user_name: {
        type: String,
        default: '',
        match: [/^\b\w{8}\d{5}\b$/],
        unique: [true, 'this user name already exists']
    },
    name: {
        type: String,
        default: ''
    },
    birthday: {
        type: String,
        default: ''
    },
    profile_pic: {
        type: String,
        default: ''
    },
    referal_username: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
    },
    twilio_message: {
        type: String
    }
}, { timestamps: true })

export default mongoose.model('User', UserSchema)