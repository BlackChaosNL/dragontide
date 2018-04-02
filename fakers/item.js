const Item = require("../models/item.js");
const faker = require("faker");

module.exports = () => {
	const itemTypes = [
		"Axe",
		"Pantaloons",
		"Ring",
		"Sword",
	];

	return {
		name: faker.name.findName(),
		type: faker.random.arrayElement(itemTypes),
		description: "",
		weight: faker.random.number(),
		stats: {
			strength: 0,
			dexterity: 0,
			constitution: 0,
			intelligence: 0,
			wisdom: 0,
			charisma: 0,
		},
		additional: "",
	};
};
