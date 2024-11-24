const mongoose = require('mongoose')
const userschema = new mongoose.Schema({
     sno:{
         type:Number
     },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
const usermodel = mongoose.model("UserDetail",userschema)
module.exports = usermodel