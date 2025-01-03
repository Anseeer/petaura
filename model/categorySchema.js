const mongoose = require("mongoose");
const {Schema} = mongoose;

const categoryShema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    parent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParentCategory',
        required: true
    },
    isListed:{
        type:Boolean,
        default:true
    },
    categoryOffer:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

});

const Category = mongoose.model("Category",categoryShema);

module.exports = Category;