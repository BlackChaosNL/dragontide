const bcrypt = require("bcrypt-nodejs");

module.exports = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};