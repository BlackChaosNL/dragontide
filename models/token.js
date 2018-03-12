const mongoose = require("mongoose");

module.exports = mongoose.model("token", new mongoose.Schema({
	userId: String,
	token: String,
	expires: Date
}));
