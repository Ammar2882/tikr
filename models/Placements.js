const mongoose = require('mongoose')
const {Schema}  = mongoose

const PlacementSchema = new mongoose.Schema({
    numbers : {
        type : [Number],
        required:true
    },
    userId : { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        index : true
    },
    betId:{
        type: Schema.Types.ObjectId, 
        ref: 'Bet',
        index : true
    }   
}, { timestamps: true })

module.exports = mongoose.model('Placement', PlacementSchema)