const express = require('express'),
	router = express.Router(),
	user = require("../models/user"),
	token = require("../models/token"),
	gh = require("../lib/generate-hash"),
	vp = require("../lib/validate-password"),
	random = require("randomstring");

/**
 * @swagger
 * /register:
 *   post:
 *     description: Registers a player to the service.
 *     produces: application/json
 *     response:
 *       200:
 *         description: Returns an active login token, to start use the service.
 */
router.post('/register', (req, res, next) => {
	const data = req.body;
	if (data.email == null || data.username == null || data.password == null)
		return res.json({ ok: false, message: "You dun goofed while registering. You forgot something." });

	user.findOne({
		$or: [{ 'email': data.email }, { 'username': data.username }]
	}, (err, p) => {
		if (err) return res.json({ ok: false, message: err });
		if (p) return res.json({ ok: false, message: "You already have an account on this service, please log in!" });
		const newplayer = user({ email: data.email, username: data.username, password: gh(data.password), admin: false });
		newplayer.save(err => {
			if (err) return res.json({ ok: false, message: err });
			return res.json({ ok: true });
		});
	});
});

/**
 * @swagger
 * /login:
 *   get:
 *     description: Logs the use in to the service.
 *     produces: application/json
 *     response:
 *       200:
 *         description: Returns an active login token, to start using the service.
 */
router.post('/login', (req, res, next) => {
	const data = req.body;
	console.log(data);
	console.log(data.username);
	console.log(data.password);
	if (data.email == null || data.password == null)
		return res.json({ ok: false, message: "E-mail or password is missing." });
	user.findOne({ email: data.email }, (err, user) => {
		if (err) return res.json({ ok: false, message: err });
		if (!vp(data.password, user.password)) {
			return res.json({ ok: false, message: "The username or password was not correct, please try again." });
		}
		var t = token({
			userId: user.id,
			token: random.generate(60),
			expires: new Date().setHours(new Date().getHours() + (24 * 7))
		});
		t.save(err => {
			if (err) return res.json({ ok: false, message: err });
			return res.json({ ok: true, message: t.token });
		});
	});
});

/**
 * @swagger
 * /logout:
 *   get:
 *     description: Destroys the players active login.
 *     produces: application/json
 *     response:
 *       200:
 *         description: Removes the active login token, so the player is successfully logged out.
 */
router.get('/logout', (req, res) => {
	if (!req.authenticated) {
		return res.status(401)
			.send({
				ok: false,
				message: "You are not logged in."
			});
	}

	token.findOneAndRemove({
		token: req.token
	}).then((err) => {
		if (err) {
			return res.status(401)
				.send({
					ok: false,
					message: err
				});
		}

		return res.json({
			ok: true,
			message: "You have been successfully logged out."
		});
	});
});

module.exports = router;
