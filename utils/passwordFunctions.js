const bcrypt = require('bcrypt');
const saltRounds = 10;
exports.encryptPassword=async(plainPassword)=> {
    try {
        const encyptedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return encyptedPassword;
    }
    catch (ex) {
        console.log(ex)
    }
}


exports.verifyPassword=async(plainPassword, hashedPassword) =>{
    try {
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        return match;
    }
    catch (ex) {
        console.log(ex)
    }
}