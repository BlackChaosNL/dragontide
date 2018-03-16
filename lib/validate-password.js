const bcrypt = require("bcrypt-nodejs");

module.exports = (p1, p2) => {
	return bcrypt.compareSync(p1, p2);
};