const userModel = require('../models/user.model.js');
const tokenBlackListModel = require("../models/blackList.model.js");
const jwt =  require('jsonwebtoken');

async function authMiddleware (req , res , next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; 
        if(!token) {
            return res.status(401).json({
                status : 401 , 
                message : "User not found "
            })
        };

        const isTokenBlacklisted = await tokenBlackListModel.findOne({token});

        if(isTokenBlacklisted) {
            return res.status(401).json({
                status : 401 ,
                message : "Unauthorized access , token is invalid !"
            })
        }
        
        try {
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);

            req.user = user ;
            next();
            
        } catch (e) {
            return res.status(401).json({
                status : 401 ,
                message : "Unauthorized Access , Token Is Invalid !" ,
            })
        }

    } catch (e) {
        return res.status(500).json({
            status : 500 ,
            message : e.message ,
        })
    }
}

async function authSystemMiddleware (req , res , next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({
                status : 401 ,
                message : "Invaild Credentials , token not found !" ,
            })
        };

        const isTokenBlacklisted = await tokenBlackListModel.findOne({token});

        if(isTokenBlacklisted) {
            return res.status(401).json({
                status : 401 ,
                message : "Unauthorized access , token is invalid !"
            })
        }

        try {
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id).select("+systemUser");

            if(!user.systemUser) {
                return res.status(403).json({
                    status : 403 ,
                    message : "you are not a system user"
                })
            };

            req.user = user ;
            return next();
        } catch (e) {
            return res.status(500).json({
                status : 500 ,
                message : e.message
            })
        }
    } catch (e) {
    return res.status(500).json({
                status : 500 ,
                message : e.message
            })
}
}

module.exports = {authMiddleware , authSystemMiddleware};