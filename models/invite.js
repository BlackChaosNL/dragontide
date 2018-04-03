const mongoose = require("mongoose");

module.exports = mongoose.model("Invite", new mongoose.Schema({
	invite: String,
	campaignId: String,
	invitedBy: String,
	expires: Date
}));
