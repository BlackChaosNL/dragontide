const user = require("../models/user");
const faker = require("faker");

module.exports = () => {
	return {
		email: faker.internet.email,
		username: faker.internet.username,
		password: faker.internet.password
	};
};
