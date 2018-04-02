const express = require('express'),
	router = express.Router(),
	Campaigns = require("../models/campaign");

router.get("/", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}
	// See characters.js for warning about pagination. (Wildly unstable)
	const skip = ((req.query.page || 1) - 1) * 30;
	const query = Campaigns.find({}).limit(30).skip(skip);

	query.exec((err, campaigns) => {
		if (err) throw new Error(err);
		return res.json({
			ok: true,
			campaigns: campaigns
		});
	});
});



module.exports = router;