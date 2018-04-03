const cplayers = require("../models/campaign-players.js");
const faker = require("faker");

module.exports = () => {
	return {
		campaignId: faker.lorem.sentence(),
		userId: faker.lorem.sentence(),
		joinedAt: faker.date.recent(7)
	};
};