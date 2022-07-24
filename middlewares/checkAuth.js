import { SuccessResponse } from '../utils/responseTempletes';

let jwt = require('jsonwebtoken');

export function checkAuth(req, res) {
    let token = req.headers && req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token && token.startsWith('Bearer')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    let secret = process.env.secretkey;
    if (token) {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
              SuccessResponse(res,false,"token is not valid",null)
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
     SuccessResponse(res,false,"token is not supplied",null)
    }
};
