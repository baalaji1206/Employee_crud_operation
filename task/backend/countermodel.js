const mongoose = require('mongoose')
const counterschema = new mongoose.Schema({
    id:{
        type: String,
    },
    seq:{
        type: Number, 
    }

})
const countermodel = mongoose.model("id_counter",counterschema)
module.exports = countermodel