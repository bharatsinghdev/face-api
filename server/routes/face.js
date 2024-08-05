const express = require('express');
const FaceSchema = require("../models/FaceSchema");
const upload = require('../middleware/Multer');
const router = express.Router();


router.get('/', async (req, res) => {
    const faces = await FaceSchema.find({});
    res.json(faces)
})


//create
router.post('/', upload.single('file'), async (req, res) => {

    const faces = await FaceSchema.create({
        name: req.body.name,
        file: req.file.filename,
        faceDescriptor: req.body.faceDescriptor
    });
    res.json(faces)
})
module.exports = router