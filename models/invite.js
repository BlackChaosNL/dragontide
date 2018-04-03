const mongoose = require("mongoose");

module.exports = mongoose.model("Invite", new mongoose.Schema({
	invite: String,
	campaignId: mongoose.Schema.ObjectId,
	invitedBy: String,
	expires: Date,
	accepted: Boolean,
	acceptedBy: String
}));
