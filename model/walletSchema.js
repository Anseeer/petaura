const mongoose = require("mongoose");
const {Schema} = mongoose;

const walletSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
    },
    balance:{
        type:Number,
        required:true,
    },
    history:[{
        type:{
        type:String,
        enum:["CREDIT","DEBIT"],
        required:true,
        },
        amount:{
            type:Number,
            required:true
        },
        description:{
            type:String,
        },
        createdAt:{
            type:Date,
            default:Date.now
        },
    }],

},{timestamps:true});

const Wallet = mongoose.model("Wallet",walletSchema);
module.exports = Wallet;