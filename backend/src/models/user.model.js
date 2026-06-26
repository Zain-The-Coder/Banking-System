const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email : {
        type : String , 
        required : [true , "Email Is Required !"] ,
        trim : true  ,
        lowercase : true ,
        unique : [true , "Email address is already taken "] ,
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ , "Invalid Email Address"]
    } ,
     name : {
        type : String ,
        required : [true , "Name is Required !"] ,
        unique : [true , "username already taken"] ,
        lowercase : true ,
        trim : true
    } ,
    password : {
        type : String ,
        required : [true , "password is required !"] ,
        minlength : [6 , "password should be contain more than 5 characters !"] ,
        select : false 
    } 
} , {timestamps : true});

userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();

    const hashPassword = await bcrypt.hash(this.password , 10);
    this.password = hashPassword ;

    return 
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password , this.password);
};

const userModel = mongoose.model("User" , userSchema) ;
module.exports = userModel ;