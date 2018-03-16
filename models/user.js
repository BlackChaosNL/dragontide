const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

module.exports = mongoose.model("User", new mongoose.Schema({
    email: String,
    username: String,
    password: String,
}));