const rollOne = (sides) => {
	return Math.floor((Math.random() * sides) + 1);
};

const rollSet = (dice, sides) => {
	const results = [];
	let rolls = 0;

	for (let i = 0; i < dice; i++) {
		results.push(rollOne(sides));
	}

	return results;
};

module.exports = {
	"rollSet": rollSet,
	"rollOne": rollOne,
};
