const userModel = require('../models/user.model.js');
const asyncHandler = require('../utils/asyncHandler.js');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service.js');
const tokenBlacklistModel = require('../models/blackList.model.js')


const registerUser = asyncHandler(async (req , res) => {
    const {email , name , password} = req.body ;

    const isExist = await userModel.findOne({
        email : email
    });

    if(isExist) {
        return res.status(422).json({
            status : 422 ,
            message : "Email already taken by another user" , 
        })
    };

    const user = await userModel.create({
        email , name , password
    });

    const token = jwt.sign({
        id :user._id
    } , process.env.JWT_SECRET ,
    {expiresIn : "3d"})

res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});

    res.status(201).json({
        status : 201 , 
        message : "User Created Successfully !" ,
        userData : user , 
        token : token
    });

    await emailService.sendRegisterEmail(user.email , user.name);
});

const loginUser = asyncHandler(async (req , res) => {
    const {email , password} = req.body ;

    const user = await userModel.findOne({email}).select("+password");

    if(!user) {
        return res.status(401).json({
            status : 401 ,
            message : "Email or Password is invalid!" 
        })
    };

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword) {
        return res.status(401).json({
            status : 401 ,
            message : "Incorrect Password"
        })
    };

    const token = jwt.sign({
        id :user._id
    } , process.env.JWT_SECRET ,
    {expiresIn : "3d"})

res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
    res.status(200).json({
        status : 201 , 
        message : "Login Successfully !" ,
        userData : user ,
        token : token
    });

})

const logout = asyncHandler(async (req , res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token) {
        return res.status(404).json({
            status : 404 ,
            message : "User logout Successfully !"
        })
    };

    res.clearCookie("token")

    await tokenBlacklistModel.create({
        token : token
    });

    return res.status(200).json({
        status : 200 ,
        message : "User Logout Successfully !"
    })
})

module.exports = {registerUser , loginUser , logout}