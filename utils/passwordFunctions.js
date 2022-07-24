const bcrypt = require('bcrypt');
const saltRounds = 10;
export async function encryptPassword(plainPassword) {
    try {
        const encyptedPassword = await bcrypt.hash(plainPassword, saltRounds);
        console.log(encyptedPassword);
        return encyptedPassword;
    }
    catch (ex) {
        return ex
    }
}


export async function verifyPassword(plainPassword, hashedPassword) {
    try {
        encryptPassword(plainPassword);
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        return match;
    }
    catch (ex) {
        return ex;
    }
}