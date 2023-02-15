const mongoose = require('mongoose')
const {Schema}  = mongoose

const WinnerSchema = new mongoose.Schema({
   
    firstPosition : { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        index : true
    },
    firstPrize : Number,
    
    secondPosition : { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        index : true
    },
    secondPrize : Number,
    thirdPosition : { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        index : true
    },
    thirdPrize:Number,
    fourthPosition : { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        index : true
    },
    fourthPrize:Number,
    betId:{
        type: Schema.Types.ObjectId, 
        ref: 'Bet',
        index : true
    }   
}, { timestamps: true })

module.exports = mongoose.model('Winner', WinnerSchema)