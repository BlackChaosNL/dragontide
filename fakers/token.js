const user = require("../models/token");
const faker = require("faker");

module.exports = () => {
	return {
		token: faker.internet.password(60, false),
		expires: faker.date.recent(7)
	};
};