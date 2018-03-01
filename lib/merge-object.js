const isObject = require("./is-object");

function mergeObject (target, ...sources) {
	if (!sources.length) {
		return target;
	}

	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeObject(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}

	return mergeObject(target, ...sources);
}

module.exports = mergeObject;
