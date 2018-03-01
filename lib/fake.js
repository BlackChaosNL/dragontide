const mergeObject = require("./merge-object");

function fakeOne(modelName, overrides) {
	const model = require("../models/" + modelName);
	const fakeData = require("../fakers/" + modelName);

	instance = model(mergeObject(fakeData(), overrides));

	return instance.save();
}

module.exports = (modelName, count, overrides) => new Promise((resolve, reject) => {
	if (!overrides) {
		overrides = {};
	}

	if (!count) {
		return resolve(fakeOne(modelName, overrides));
	}

	const instances = [];

	for (let i = 0; i < count; i++) {
		instances[i] = fakeOne(modelName, overrides);
	}

	return resolve(instances);
});
