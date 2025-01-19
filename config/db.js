const mongoose = require("mongoose");
const logger = require('./logger'); 
const env = require("dotenv").config();

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("DB connected")
    } catch (error) {
        logger.error("DB connection error", error.message);  
        process.exit(1);
    }
};

module.exports = connectDB ;