const express = require('express');
const FaceSchema = require("../models/FaceSchema");
const upload = require('../middleware/Multer');
const router = express.Router();


router.get('/', async (req, res) => {
    const faces = await FaceSchema.findById("66ab765816887efaab0e948f");
    res.json(faces)
})


//create
router.post('/', upload.single('image'), async (req, res) => {
    const file = req.files.pathname;
    console.log(file)
    const faces = await FaceSchema.create(req.body);
    console.log(faces)
    res.json(faces)
})
module.exports = router