const mongoose = require('mongoose');

const tokenBlackListSchema = new mongoose.Schema({
    token : {
        type : String ,
        required : [true , "Token is required for blacklist"] ,
        unique : [true , "Token is already blacklisted !"]
    } 
} , {timestamps : true});

tokenBlackListSchema.index({createdAt : 1} , {
    expireAfterSeconds : 60 * 60 * 24 * 30
});

const tokenBlackListModel = mongoose.model("tokenBlacklist" , tokenBlackListSchema);
module.exports = tokenBlackListModel ;