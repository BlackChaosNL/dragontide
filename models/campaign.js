const mongoose = require("mongoose"),
	user = require("./user").Schema;

module.exports = mongoose.model("Campaign", new mongoose.Schema({
	Title: String,
	GM: {
		type: [user],
		default: undefined
	},
	Active: Boolean,
	Private: Boolean,
	Password: String
}));
