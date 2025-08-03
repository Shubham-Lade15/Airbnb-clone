const cloudinary = require('cloudinary').v2;
const DatauriParser = require('datauri/parser'); // For converting buffer to data URI
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const parser = new DatauriParser();

// Function to convert buffer to data URI
const formatBufferToDataUri = file => parser.format(path.extname(file.originalname).toString(), file.buffer);

// Function to upload a single file
const uploadSingleImage = async (fileBuffer, folder = 'airbnb-clone') => {
  const fileUri = formatBufferToDataUri(fileBuffer).content;
  return cloudinary.uploader.upload(fileUri, {
    folder: folder,
    resource_type: 'image' // Ensure it's treated as an image
  });
};

// Function to upload multiple files
const uploadMultipleImages = async (files, folder = 'airbnb-clone') => {
  const uploadPromises = files.map(file => {
    const fileUri = formatBufferToDataUri(file).content;
    return cloudinary.uploader.upload(fileUri, {
      folder: folder,
      resource_type: 'image'
    });
  });
  return Promise.all(uploadPromises);
};

module.exports = {
  cloudinary,
  uploadSingleImage,
  uploadMultipleImages
};