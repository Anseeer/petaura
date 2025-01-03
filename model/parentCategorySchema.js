const mongoose = require("mongoose");
const {Schema} = mongoose; 

const parentcategorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    isListed:{
        type:Boolean,
        default:true
    },
});

const ParentCategory = mongoose.model("ParentCategory",parentcategorySchema);

module.exports = ParentCategory ; 