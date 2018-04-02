const express = require('express'),
	router = express.Router(),
	Campaigns = require("../models/campaign"),
	token = require("../models/token"),
	user = require("../models/user"),
	gh = require("../lib/generate-hash");

/**
 * @swagger
 * /campaign:
 *   get:
 *     description: Get a list of campaigns
 *     produces: application/json
 *     response:
 *       200:
 *         description: A list of 30 campaigns
 *		 401:
 *		   description: User is not logged in, or does not have valid credentials.
 *   post:
 *     description: Create a new campaign
 *     produces: application/json
 *     response:
 *       200:
 *         description: A campaign.
 *		 401:
 *		   description: User is not logged in, or does not have valid credentials.
 */
router.get("/", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}
	// See characters.js for warning about pagination. (Wildly unstable)
	const skip = ((req.query.page || 1) - 1) * 30;
	const query = Campaigns.find({
		Private: false
	}).limit(30).skip(skip);

	query.exec((err, campaigns) => {
		if (err) throw new Error(err);
		return res.json({
			ok: true,
			campaigns
		});
	});
}).post("/", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}

	const campaign_name = req.body.name,
		campaign_description = req.body.description,
		campaign_password = req.body.password;

	if (campaign_name == null || campaign_description == null) {
		return res.json({
			ok: false,
			message: "Please fill in the campaign name and description. (Optionally the password)"
		});
	}
	token.findOne({
		token: req.token.token
	}, (err, t) => {
		user.findOne({
			_id: t.userId
		}, (err, u) => {
			const c = Campaigns({
				title: campaign_name,
				description: campaign_description,
				dm: u._id,
				active: true,
				private: ((campaign_password == null) ? false : true),
				password: ((campaign_password == null) ? "" : gh(campaign_password))
			});
			c.save((err) => {
				if (err) return res.json({
					ok: false,
					message: err
				});
				return res.json({
					ok: true,
					campaign: c
				});
			});
		});
	});
});

/**
 * @swagger
 * /campaign/{campaignid}:
 *   get:
 *     description: Get a single campaign
 *     produces: application/json
 *     response:
 *       200:
 *         description: A single campaign
 *		 401:
 *		   description: User is not logged in, or does not have valid credentials.
 */
router.get("/:campaignid", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}

	Campaigns.findOne({
		_id: req.params.campaignid
	}, (err, campaign) => {
		if (err) {
			return res.status(404).json({
				ok: false,
				message: err
			});
		}

		if (!campaign) {
			return res.status(404).json({
				ok: false,
				message: "Campaign was not found."
			});
		}

		return res.json({
			ok: true,
			campaign
		});
	});
});

module.exports = router;