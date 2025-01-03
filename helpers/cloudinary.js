const cloudinary = require("cloudinary").v2;
const env = require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, // Correct key name
    api_key: process.env.CLOUD_API_KEY, // Correct key name
    api_secret: process.env.CLOUD_API_SECRET, // Correct key name
});

module.exports = cloudinary;

