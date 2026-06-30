const transactionModel = require("../models/transaction.model.js");
const ledgerModel = require('../models/ledger.model.js')
const asyncHandler = require('../utils/asyncHandler.js');
const accountModel = require("../models/account.model.js");
const { default: mongoose } = require("mongoose");
const {sendTransactionEmail} = require('../services/email.service.js')


const initialTransaction = asyncHandler(async (req , res) => {

    // VALIDATE REQUESTS OR ACCOUNTS
    const {fromAccount , toAccount , amount , idempotencyKey} = req.body ;

    if(!toAccount || !amount || !idempotencyKey || !fromAccount) {
        return res.status(400).json({
            status : 400 ,
            message : "All fields are required !"
        })
    };

    const fromUserAccount = await accountModel.findOne({
        _id : fromAccount
    });

    const toUserAccount = await accountModel.findOne({
        _id : toAccount
    });

    if(!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            status : 400 ,
            message : "Transaction failed ! Maybe account no is invalid !"
        })
    }

    //VALIDATE IDEMPOTENCY KEY
    const isTransactionAlreadyExist = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    });

    if(isTransactionAlreadyExist) {
        if(isTransactionAlreadyExist.status === "COMPLETED") {
            return res.status(200).json({
                status : 200 ,
                message : "You transaction processed successfully !"
            })
        }
        if(isTransactionAlreadyExist.status === "PENDING") {
            return res.status(200).json({
                status : 200 ,
                message : "your transaction is in pending !"
            })
        }
        if(isTransactionAlreadyExist.status === "FAILED") {
            return res.status(400).json({
                status :  400 ,
                message : 'Your Transaction failed  !'
            })
        }
        if(isTransactionAlreadyExist.status === "REVERSED") {
            return res.status(500).json({
                status : 500 ,
                message : "your transaction reversed due to some server error"
            })
        }
    };

    //ACCOUNT STATUS CHECKING
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        console.log(fromAccount.status,toAccount.status )
        return res.status(500).json({
            status : 500 ,
            message : "Account disactive or closed between one or both !" ,
        })
    };

    const balance = await fromUserAccount.getBalance();

    if(balance < amount) {
        return res.status(403).json({
            status : 403 ,
            message : `Insufficient Balance . Your Balance is ${balance}`
        })
    };

let transaction;
    try {

        /**
         * 5. Create transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await transactionModel.create([ {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ]

        const debitLedgerEntry = await ledgerModel.create([ {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        const creditLedgerEntry = await ledgerModel.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )


        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })

    }

    sendTransactionEmail(req.user.email , req.user.name , amount , toAccount);

    res.status(201).json({
        status : 201 , 
        message : "Transaction Completed Successfully !" ,
        transaction_Details : transaction
    })

    
});

const createInitialFundsTransaction = asyncHandler(async (req, res) => {
const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })

});

module.exports = {initialTransaction , createInitialFundsTransaction};