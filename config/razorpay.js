const Razorpay = require("razorpay");
 const env =require("dotenv").config();


const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY, // Replace with your Razorpay Key ID
  key_secret: process.env.RAZORPAY_SECRET, // Replace with your Razorpay Secret
});

module.exports = razorpayInstance;
