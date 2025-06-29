const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload image from URL to Cloudinary
const uploadImageFromUrl = async (imageUrl, folder = 'profile_pictures') => {
  try {
    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // Convert the image data to a buffer
    const buffer = Buffer.from(response.data, 'binary');
    
    // Create a readable stream from the buffer
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: folder,
        resource_type: 'auto',
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          throw error;
        }
        return result;
      }
    );
    
    // Create a readable stream and pipe it to Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: folder,
          resource_type: 'auto',
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:good'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadImageFromUrl
};
