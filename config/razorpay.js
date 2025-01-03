const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_SVAqK9YTUX1qbQ", // Replace with your Razorpay Key ID
  key_secret: "ZBzWG2cYmWNJZauotJTPBNL6", // Replace with your Razorpay Secret
});

module.exports = razorpayInstance;
