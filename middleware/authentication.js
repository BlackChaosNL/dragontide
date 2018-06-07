const token = require("../models/token"),
	user = require("../models/user");

module.exports = (req, res, next) => {
	if (!req.headers.authorization) {
		req.authenticated = false;

		return next();
	}

	const reqtoken = req.headers.authorization.split(" ");

	if (reqtoken[0] != 'Bearer') return next();

	token.findOne({
		token: reqtoken[1]
	}, (err, token) => {
		if (err || !token) {
			req.authenticated = false;

			return next();
		}

		const now = new Date().getTime();
		const expiry = new Date(token.expires).getTime();

		if (expiry < now) throw new Error("Bearer token expired.");
		// Verify admin
		user.findOne({
			_id: token.userId
		}, (err, admuser) => {
			if (err) {
				req.isAdmin = false;
				return next(err);
			};
			if (!admuser) {
				throw new Error("No user could be found in the system.");
			}
			if (admuser.admin) req.isAdmin = true;

			req.authenticated = true;
			req.token = token;

			return next();
		});
	});
};
