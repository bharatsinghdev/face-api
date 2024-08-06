const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'daqcahpo7',
    api_key: '398183627549681',
    api_secret: 't6PYmxTyrDcN18DBSz7TmPSIzF0'
});


// CLOUDINARY_URL = cloudinary://398183627549681:t6PYmxTyrDcN18DBSz7TmPSIzF0@daqcahpo7
// Cloud_name = daqcahpo7
// API_KEY = 398183627549681
// API_SECRET = t6PYmxTyrDcN18DBSz7TmPSIzF0

const uploadImageToCloudinary = async (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, (result) => {
            resolve(result);
        });
    });
};

module.exports = uploadImageToCloudinary;

