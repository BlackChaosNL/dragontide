const mongoose = require("mongoose");

module.exports = mongoose.model("Token", new mongoose.Schema({
	userId: String,
	token: String,
	expires: Date
}));
