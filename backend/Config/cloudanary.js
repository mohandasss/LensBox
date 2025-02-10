require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Your Cloud name
  api_key: process.env.CLOUDINARY_API_KEY,      // Your API key
  api_secret: process.env.CLOUDINARY_API_SECRET,  // Your API secret
});

module.exports = cloudinary;
