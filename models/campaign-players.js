const mongoose = require("mongoose");

module.exports = mongoose.model("CampaignPlayers", new mongoose.Schema({
	campaignId: String,
	userId: String,
	joinedAt: Date
}));
