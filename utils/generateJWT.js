console.log(process.env.JWT_SECRET , " jwt secret")
import jwt from 'jsonwebtoken'
export const JWT  = (result) =>{
    const token = jwt.sign({
        data: [result.phone, result._id],
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return token
}