let config = {
	debug: false,
	db: {
		host: process.env.username + ":" + process.env.password + "@ds141720.mlab.com:41720",
		collection: "dragontide",
	},
	logging: {
		requests: true,
	},
};
