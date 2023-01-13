import bcrypt  from 'bcrypt';
const saltRounds = 10;
export async function encryptPassword(plainPassword) {
    try {
        const encyptedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return encyptedPassword;
    }
    catch (ex) {
        console.log(ex)
    }
}


export async function verifyPassword(plainPassword, hashedPassword) {
    try {
        encryptPassword(plainPassword);
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        return match;
    }
    catch (ex) {
        console.log(ex)
    }
}