const mongoose = require('mongoose')
const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: String,
    password: {
        type: String,
        required: true,
    },
    confirmpassword: {
        type: String,
        required: true,
    },
    token: String,
    createdAt:{
        type: Date,
        default: Date.now,
    },
})
module.exports = mongoose.model("users", user);