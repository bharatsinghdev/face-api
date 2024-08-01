const { Schema, model } = require('mongoose');

const faceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    faceDescriptor: {
        type: String,
        required: true
    }
})


module.exports = model('Face', faceSchema)