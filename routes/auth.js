const express = require('express'),
	router = express.Router(),
	auth = require("../middleware/authentication"),
	user = require("../models/user"),
	token = require("../models/token"),
	gh = require("../lib/generate-hash");

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
		const newplayer = user({ email: data.email, username: data.username, password: gh(data.password) });
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
 *         description: Returns an active login token, to start use the service.
 */
router.post('/login', (req, res, next) => {

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
router.get('/logout', auth, (req, res, next) => {

});

module.exports = router;