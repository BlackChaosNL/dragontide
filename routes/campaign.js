const express = require('express'),
	router = express.Router(),
	Campaigns = require("../models/campaign"),
	token = require("../models/token"),
	user = require("../models/user"),
	gh = require("../lib/generate-hash"),
	vp = require("../lib/validate-password"),
	cplayers = require("../models/campaign-players"),
	invite = require("../models/invite"),
	random = require("randomstring"),
	Campaign = require("../models/campaign");

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
		private: false
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
				password: ((campaign_password == null) ? "" : campaign_password)
			});
			c.save((err) => {
				if (err) return res.json({
					ok: false,
					message: err
				});

				const campplayer = cplayers({
					campaignId: c._id,
					userId: u._id,
					joinedAt: new Date(Date.now())
				});

				campplayer.save(err => {
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
});

/**
 * @swagger
 * /campaign:
 *   get:
 *     description: Join a campaign by invite.
 *     produces: application/json
 *     response:
 *       200:
 *         description: A campaign.
 *		 401:
 *		   description: User is not logged in, or does not have valid credentials.
 */
router.post("/invite", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}

	invite.findOne({
		invite: (!req.body.invite) ? "" : req.body.invite
	}, (err, invite) => {
		if (err) return res.status(401).json({
			ok: false,
			message: err
		});

		if (!invite) return res.status(404).json({
			ok: false,
			message: "This invite is not valid."
		});

		if (new Date(Date.now()) > invite.expires || invite.accepted) {
			return res.status(404).json({
				ok: false,
				message: "This invite has expired, please request a new one."
			});
		}

		invite.accepted = true;
		invite.acceptedBy = req.token.userId;

		invite.save(err => {
			if (err) return res.status(401).json({
				ok: false,
				message: err
			});

			const campplayers = cplayers({
				userId: req.token.userId,
				campaignId: invite.campaignId,
				joinedAt: new Date(Date.now())
			});

			campplayers.save(err => {
				if (err) return res.status(404).json({
					ok: false,
					message: err
				});

				Campaign.findOne({"_id": invite.campaignId})
					.then(campaign => {
						return res.json({
							ok: true,
							message: "You have joined the " + campaign.title + " campaign.",
						});
					}).catch(e => { throw e; });
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
			campaign: campaign,
		});
	});
}).put("/:campaignid", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}

	Campaigns.findById({
		_id: req.params.campaignid
	}, (err, campaign) => {
		if (err) return {
			ok: false,
			message: err
		};

		if (!req.isAdmin && req.token.userId != campaign.dm) {
			return res.json(401).json({
				ok: false,
				message: "You can not alter this campaign."
			});
		}

		[
			"title",
			"description",
			"dm",
			"private",
			"password"
		].forEach(item => {
			if (item == "password" && req.body[item]) {
				campaign[item] = gh(req.body[item]);
			}

			if (campaign[item] && req.body[item]) {
				campaign[item] = req.body[item];
			}
		});

		campaign.save(err => {
			if (err) return res.status(404).json({
				ok: false,
				message: err
			});
			return res.json({
				ok: true,
				message: "Saved."
			});
		});
	});
}).patch("/:campaignid", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}

	Campaigns.findById({
		_id: req.params.campaignid
	}, (err, campaign) => {
		if (err) return {
			ok: false,
			message: err
		};

		if (!req.isAdmin && req.token.userId != campaign.dm) {
			return res.json(401).json({
				ok: false,
				message: "You can not alter this campaign."
			});
		}

		[
			"title",
			"description",
			"dm",
			"private",
			"password"
		].forEach(item => {
			if (item == "password" && req.body[item]) {
				campaign[item] = gh(req.body[item]);
			}

			if (campaign[item] && req.body[item]) {
				campaign[item] = req.body[item];
			}
		});

		campaign.save(err => {
			if (err) return res.status(404).json({
				ok: false,
				message: err
			});
			return res.json({
				ok: true,
				message: "Saved."
			});
		});
	});
}).delete("/:campaignid", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}
	Campaigns.findOne({
		_id: req.params.campaignid
	}, (err, campaign) => {
		if (err || campaign == null) return res.status(404).json({
			ok: false,
			message: "Campaign could not be found."
		});

		if (!req.isAdmin && req.token.userId != campaign.dm) {
			return res.json(401).json({
				ok: false,
				message: "You can not remove this campaign."
			});
		}
		Campaigns.findByIdAndRemove({
			_id: req.params.campaignid
		}, err => {
			if (err) return res.status(404).json({
				ok: false,
				message: err
			});

			return res.json({
				ok: true,
				message: "Campaign has been removed."
			});
		});
	});
});

/**
 * @swagger
 * /campaign/{campaignid}/join:
 *   post:
 *     description: Join a campaign
 *     produces: application/json
 *     response:
 *       200:
 *         description: A single campaign
 *		 401:
 */
router.post("/:campaignid/join", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}

	Campaigns.findOne({
		_id: req.params.campaignid
	}, (err, campaign) => {
		if (err) return res.status(404).json({
			ok: false,
			message: err
		});
		if (!campaign) return res.status(404).json({
			ok: false,
			message: "Campaign not found."
		});

		if (campaign.private) {
			if (campaign.password == (((!req.body.password) ? "" : req.body.password))) {
				return res.status(401).json({
					ok: false,
					message: "Password for this campaign is not correct."
				});
			}
		}

		const campplayers = cplayers({
			userId: req.token.userId,
			campaignId: campaign.id,
			joinedAt: new Date(Date.now())
		});

		campplayers.save(err => {
			if (err) return res.status(404).json({
				ok: false,
				message: err
			});
			return res.json({
				ok: true,
				message: "You have joined the " + campaign.title + " campaign."
			});
		});
	});
});

/**
 * @swagger
 * /campaign/{campaignid}/invite:
 *   get:
 *     description: Invite a person to a campaign
 *     produces: application/json
 *     response:
 *       200:
 *         description: Returns a invite for joining a campaign.
 *		 401:
 */
router.get("/:campaignid/invite", (req, res, next) => {
	if (!req.authenticated) {
		return res.status(401).json({
			ok: false,
			message: "Please log in to use this feature."
		});
	}

	cplayers.findOne({
		campaignId: req.params.campaignid,
		userId: req.token.userId
	}, (err, cplayer) => {
		if (err) return res.status(404).json({
			ok: false,
			message: err
		});
		if (!cplayer) return res.status(401).json({
			ok: false,
			message: "You are not allowed to create an invite for this campaign."
		});
		// Invites are valid for a week
		// ToDo: make expiration date variable.
		const inv = invite({
			invite: random.generate(60),
			campaignId: req.params.campaignid,
			invitedBy: req.token.userId,
			expires: new Date().setHours(new Date().getHours() + (24 * 7)),
			accepted: false,
			acceptedBy: null
		});

		inv.save(err => {
			if (err) return res.status(404).json({
				ok: false,
				message: err
			});
			return res.json({
				ok: true,
				invite: inv.invite
			});
		});
	});
});

module.exports = router;
