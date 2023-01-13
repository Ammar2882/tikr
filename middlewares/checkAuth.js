

import jwt from 'jsonwebtoken';

export const checkAuth=(req, res,next)=> {
    let token = req.headers && req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token && token.startsWith('Bearer')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    let secret = process.env.JWT_SECRET;
    if (token) {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                res.json({
                    success:false,
                    status:401,
                    message:"token is not valid",
                    data:null
                })
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        res.json({
            success:false,
            status:401,
            message:"token is not supplied",
            data:null
        })
    }
};
