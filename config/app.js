const merge = require("merge");

let config = {
	debug: false,
	db: {
		host: "localhost",
		collection: "dragontide",
	},
	logging: {
		requests: true,
	},
};

// Overwrite base config with test parts if the APP_ENV is set to test
if (process.env.APP_ENV) {
	try {
		config = merge.recursive(true, config, require("./" + process.env.APP_ENV + ".js"));
	} catch (err) {
		// stubbed
	}
}

module.exports = config;
