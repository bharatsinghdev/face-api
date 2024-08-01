const mongoose = require("mongoose");

const connectDB = () => {
    console.log(process.env.MONGO_URI)
    return mongoose.connect(process.env.MONGO_URI);
}
module.exports = connectDB