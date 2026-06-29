const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware.js');
const accountController = require('../controllers/account.controller.js')

const accountRouter = express.Router();

accountRouter.get("/" , authMiddleware.authMiddleware , accountController.getUserAccounts);
accountRouter.get("/balance/:accountId" , authMiddleware.authMiddleware , accountController.getAccountBalance)
accountRouter.post("/" , authMiddleware.authMiddleware , accountController.createAccount);


module.exports = accountRouter ;