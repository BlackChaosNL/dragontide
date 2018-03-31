const mongoose = require("mongoose");

module.exports = mongoose.model("User", new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    admin: Boolean
}));