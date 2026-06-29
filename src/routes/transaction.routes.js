const express = require('express');

const transactionRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware.js');
const transectionController = require('../controllers/transaction.controller.js')

transactionRouter.post("/" , authMiddleware.authMiddleware , transectionController.initialTransaction );
transactionRouter.post("/system/initial-funds" , authMiddleware.authSystemMiddleware , transectionController.createInitialFundsTransaction);


module.exports = transactionRouter ;