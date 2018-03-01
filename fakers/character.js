const Character = require("../models/character.js");
const faker = require("faker");

module.exports = () => {
	return {
		name: faker.name.findName(),
		level: 1,
		stats: {
			strength: 2,
			dexterity: 2,
			constitution: 2,
			intelligence: 2,
			wisdom: 2,
			charisma: 2,
		}
	};
};
