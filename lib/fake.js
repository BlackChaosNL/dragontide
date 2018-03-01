const mergeObject = require("./merge-object");

module.exports = (modelName, count, overrides) => new Promise((resolve, reject) => {
	if (!overrides) {
		overrides = {};
	}

	const model = require("../models/" + modelName);
	const instances = [];
	const j = (count || 1);

	for (let i = 0; i < j; i++) {
		const fakeData = require("../fakers/" + modelName);

		instances[i] = model(mergeObject(fakeData(), overrides));

		instances[i].save(err => {
			if (err) {
				return reject(err);
			}
		});
	}

	if (!count) {
		return resolve(instances[0]);
	}

	return resolve(instances);
});
