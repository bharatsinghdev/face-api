
const fs = require('fs');
const uploadImageToCloudinary = require('./CloudinarySave');
const getNamesFromImage = require('./search');
module.exports = ReverseGoogle = async (url) => {
    console.log("Local URL", url)
    try {
        let cloudurl = await uploadImageToCloudinary(url);
        console.log("cloudurl", cloudurl.url)
        let arrNames = await getNamesFromImage(cloudurl.url)
        console.log("arrNames", arrNames)
        return arrNames[0]
    } catch (err) {
        throw err
    }
};

