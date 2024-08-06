const express = require('express');
const FaceSchema = require("../models/FaceSchema");
const upload = require('../middleware/Multer');
const ReverseGoogle = require('../utils/reverse_image');
const router = express.Router();
const path = require('path');
router.get('/', async (req, res) => {
    const faces = await FaceSchema.find({});
    res.json(faces)
})

//create
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log(req.body)
        let data = await ReverseGoogle(path.join(__dirname, '..', 'uploads', req.file.filename))
        // req.body.name = req.body.name ? req.body.name : data
        const faces = await FaceSchema.create({ name: data, file: req.file.filename, faceDescriptor: req.body.faceDescriptor });
        res.json(faces)
    } catch (err) {
        console.log(err)
    }
})
module.exports = router