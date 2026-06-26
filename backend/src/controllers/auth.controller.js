const userModel = require('../models/user.model.js');
const asyncHandler = require('../utils/asyncHandler.js');
const jwt = require('jsonwebtoken');


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

    res.cookie("token" , token);

    res.status(201).json({
        status : 201 , 
        message : "User Created Successfully !" ,
        userData : user , 
        token : token
    });
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

    res.cookie("token" , token);

    res.status(200).json({
        status : 201 , 
        message : "Login Successfully !" ,
        userData : user ,
        token : token
    });

})

module.exports = {registerUser , loginUser}