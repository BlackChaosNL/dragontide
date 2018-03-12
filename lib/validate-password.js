module.exports = (password) => {
	return bcrypt.compareSync(password, this.local.password);
};