const mongoose = require("mongoose");

module.exports = mongoose.model("Character", new mongoose.Schema({
	name: String,
	level: Number,
	stats: {
		strength: Number,
		dexterity: Number,
		constitution: Number,
		intelligence: Number,
		wisdom: Number,
		charisma: Number,
	},
}));
