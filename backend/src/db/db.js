const mongoose = require('mongoose');
require('dotenv').config();


async function connectDB () {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected , DB Host : ${connectionInstance.connection.host}`)
    } catch (e) {
        console.log(e.message)
        process.exit(1);
    }
}

module.exports = connectDB;