const user = require("../models/user");
const faker = require("faker");

module.exports = () => {
	return {
		email: faker.internet.email(),
		username: faker.internet.userName(),
		password: faker.internet.password()
	};
};
