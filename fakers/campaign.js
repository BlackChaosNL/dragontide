const campaign = require("../models/campaign");
const faker = require("faker");

module.exports = () => {
	// Add password & GM user yourself.
	return {
		title: faker.lorem.sentence(),
		description: faker.lorem.sentence(),
		dm: faker.lorem.sentence(),
		active: faker.random.boolean(),
		private: faker.random.boolean(),
		password: faker.lorem.sentence()
	};
};