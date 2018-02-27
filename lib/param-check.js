module.exports = (param, check, message) => {
	if (param == undefined) {
		throw message;
	}

	if (!check(param)) {
		throw message;
	}
};
