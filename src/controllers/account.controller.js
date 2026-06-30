const accountModel = require('../models/account.model.js');
const asyncHandler = require('../utils/asyncHandler.js')

const getUserAccounts = asyncHandler(async (req , res) => {
    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        accounts
    });  
})

const createAccount = asyncHandler(async (req , res) => {
    const user = req.user ;

    const account = await accountModel.create({
        user : user._id
    });

    

    
    res.status(201).json({
        status : 201 , 
        message : "Account Created Successfully !" ,
        account
    });
});

const getAccountBalance = asyncHandler(async (req , res) => {
    const {accountId} = req.params

    const account = await accountModel.findOne({
        _id : accountId ,
        user : req.user._id
    });

    if(!account) {
        return res.status(404).json({
        message : `The account with id ${accountId} not found !`
    })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId : account._id ,
        balance 
    })

})

module.exports = {createAccount , getUserAccounts , getAccountBalance};