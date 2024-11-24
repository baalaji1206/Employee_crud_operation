const mongoose = require('mongoose')
const empschema = new mongoose.Schema({
    id:{
         type:Number,
         required:true,
         unique:true

     },
    profileimg:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:Number,
        required:true

    },
    desig:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    course:{
        type:[String],
        default:[],
        required:true
    },
    createdate:{
        type:String,
        default:()=>{
            const today = new Date();
            const datestring = today.toISOString().split('T')[0];
            return datestring;
        }
    }
})
const empmodel = mongoose.model("empDetail",empschema)
module.exports = empmodel