const campaign = require("../models/campaign");
const faker = require("faker");

module.exports = () => {
	// Add password & GM user yourself.
	return {
		Title: faker.lorem.sentence(),
		Active: faker.random.boolean(),
		Private: faker.random.boolean()
	};
};