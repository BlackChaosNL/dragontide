const config = require("../config/app");

module.exports = (modelName) => new Promise((resolve, reject) => {
	if (config.debug) {
		console.log("purge-collection: require(\"../models/" +  modelName + "\")");
	}

	const model = require("../models/" + modelName);

	model.remove({}, err => {
		if (err) {
			return reject(err);
		}

		return resolve();
	});
});
