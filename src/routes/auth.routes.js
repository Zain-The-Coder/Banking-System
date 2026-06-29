const express = require('express');
const authController = require('../controllers/auth.controller.js')

const authRouter = express.Router();

authRouter.post("/register" , authController.registerUser);
authRouter.post("/login" , authController.loginUser);
authRouter.post("/logout" , authController.logout);

module.exports = authRouter ;