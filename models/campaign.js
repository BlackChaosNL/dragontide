const mongoose = require("mongoose"),
	user = require("./user").Schema;

module.exports = mongoose.model("Campaign", new mongoose.Schema({
	title: String,
	description: String,
	dm: String,
	active: Boolean,
	private: Boolean,
	password: String
}));
