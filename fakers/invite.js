const invite = require("../models/invite.js");
const faker = require("faker");

module.exports = () => {
	return {
		invite: '',
		campaignId: null,
		invitedBy: '',
		expires: faker.date.recent(7),
		accepted: faker.random.boolean(),
		acceptedBy: ''
	};
};
