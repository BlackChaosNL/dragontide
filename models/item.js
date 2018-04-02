const mongoose = require("mongoose");

module.exports = mongoose.model("Item", new mongoose.Schema({
	name: String,
	type: String,
	description: String,
	weight: Number,
	stats: {
		strength: Number,
		dexterity: Number,
		constitution: Number,
		intelligence: Number,
		wisdom: Number,
		charisma: Number,
	},
	additional: String,
}));
