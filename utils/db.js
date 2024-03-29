const mongoose =require('mongoose')
const db = mongoose.connection;
const connectDb = async(mongouri)=>{
    var CONNECTION_URL = `${mongouri}`
   mongoose.connect(CONNECTION_URL, { keepAliveInitialDelay: 300000 });
    
    db.on('connected', () => {
        console.log('Succesfully connected to database')
    
    })
    db.on('error', (error) => {
        console.log(`Error occured connecting to database: ${error.message}`)
    })
}

module.exports = connectDb