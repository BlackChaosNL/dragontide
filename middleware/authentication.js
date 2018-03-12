const token = require("../models/token");

module.exports = (req, res, next) => {
	if (!req.headers.authentication) {
		req.authenticated = false;
		return next();
	}

	const reqtoken = req.headers.authorization.split(" ");

	if (reqtoken[0] != 'Bearer') return next();

	token.findOne({ token: reqtoken[1] }, (err, token) => {
		if (err) {
			req.authenticated = false;
			return next();
		}
		if (!token) throw new Error("Token is not accepted, renew the access token please.");
		if (new Date().getTime() < token.expiring) throw new Error("Bearer token expired.");
		req.authenticated = true;
		req.token = token;
	});

	return next();
}