const merge = require("merge");

function fakeOne(modelName, overrides) {
	const model = require("../models/" + modelName);
	const fakeData = require("../fakers/" + modelName);

	instance = new model(merge.recursive(true, fakeData(), overrides));

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

	Promise.all(instances)
		.then(x => resolve(x))
		.catch(e => reject(e));
});
