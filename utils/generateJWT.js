const jwt = require('jsonwebtoken')
exports.JWT  = async(result) =>{
    const token = jwt.sign({
        data: [result.phone, result._id],
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return token
}