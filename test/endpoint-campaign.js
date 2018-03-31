const app = require("../app");
const assert = require("chai").assert;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");
const gh = require("../lib/generate-hash");

before(done => {
	fake("user").then(user => {
		fake("campaign", 50, {
			password: gh("vis")
		}).then(c => {
			done();
		});
	});
});

describe("Test campaign endpoint", () => {
	// Unauthorized users can't do anything in the campaign route.
	it("User can not get a list of active campaigns when not logged in.", done => {
		request(app)
			.get("/campaign/")
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);
				assert.isFalse(res.body.ok);
				done();
			});
	});

	// Get a list of campaigns.
	it("User can get a list of active campaigns.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user._id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				request(app)
					.get("/campaign/")
					.set('Authorization', 'Bearer ' + tokens[0].token)
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						assert.isArray(res.body.campaigns);
						done();
					});
			});
		});
	});

	// Get pagination of campaign list.
	it("User can get page two of active campaigns.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user._id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				request(app)
					.get("/campaign?page=2")
					.set('Authorization', 'Bearer ' + tokens[0].token)
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						assert.isArray(res.body.campaigns);
						done();
					});
			});
		});
	});

	// User can get a campaign
	it("User can get details from a campaign.", done => {
		fake("user").then(user => {
			fake("campaign").then(campaign => {
				fake("token", 1, {
					userId: user._id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.get("/campaign/" + campaign[0]._id)
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							assert.isObject(res.body.campaign);
							done();
						});
				});
			});
		});
	});

	// Create a campaign.
	it("Campaign can not be created by a non-player.", done => {
		request(app)
			.post("/campaign/")
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);
				assert.isFalse(res.body.ok);
				assert.isString(res.body.message);
				done();
			});
	});

	// Public.
	it("User can create their own public campaign.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user._id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				request(app)
					.post("/campaign/")
					.set('Authorization', 'Bearer ' + tokens[0].token)
					.send({
						title: "Vistastische Campaign!",
						private: false
					})
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						assert.isObject(res.body.campaign);
						done();
					});
			});
		});
	});

	// Private.
	it("User can create their own private campaign.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user._id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				request(app)
					.post("/campaign/")
					.set('Authorization', 'Bearer ' + tokens[0].token)
					.send({
						title: "Vistastische Campaign!",
						private: true,
						password: "vis"
					})
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						assert.isObject(res.body.campaign);
						done();
					});
			});
		});
	});

	// Campaign can be altered when required by the GM.
	// put
	it("GM can alter their own campaign. (Put)", done => {
		fake("user").then(user => {
			fake("campaign", 1, {
				GM: user,
				Private: false,
				Password: null
			}).then(campaign => {
				fake("token", 1, {
					userId: user._id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.put("/campaign/" + campaign._id)
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.send({
							title: "Vistastische Campaign #Continues!",
							private: true,
							password: "vis"
						})
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							done();
						});
				});
			});
		});
	});

	// patch
	it("GM can alter their own campaign. (Patch)", done => {
		fake("user").then(user => {
			fake("campaign", 1, {
				GM: user,
				Private: false,
				Password: null
			}).then(campaign => {
				fake("token", 1, {
					userId: user._id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.patch("/campaign/" + campaign._id)
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.send({
							title: "Vistastische Campaign #Continues!",
							private: true,
							password: "vis"
						})
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							done();
						});
				});
			});
		});
	});
	// Join a campaign.
	// Public.
	it("User can join a public campaign.", done => {
		fake("user").then(user => {
			fake("campaign", 1, {
				Private: false,
				Password: null
			}).then(campaign => {
				fake("token", 1, {
					userId: user._id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.get("/campaign/" + campaign._id + "/join")
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							done();
						});
				});
			});
		});
	});

	// Private.
	// Wrong password.
	it("User can not join a private campaign without a password.", done => {
		fake("user").then(user => {
			fake("campaign", 1, {
				Private: true,
				Password: gh("fishstick")
			}).then(campaign => {
				fake("token", 1, {
					userId: user._id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.post("/campaign/" + campaign._id + "/join")
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.send({
							password: "apples"
						})
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							done();
						});
				});
			});
		});
	});

	// Right password.
	it("User can join a private campaign with a password.", done => {
		fake("user").then(user => {
			fake("campaign", 1, {
				Private: true,
				Password: gh("fishstick")
			}).then(campaign => {
				fake("token", 1, {
					userId: user._id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.post("/campaign/" + campaign._id + "/join")
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.send({
							password: "fishstick"
						})
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							done();
						});
				});
			});
		});
	});

	// Invite.
	// Expired.
	it("User can not join an invited campaign without a valid invite.", done => {
		return done();
	});

	// Active
	it("User can join an invited campaign with a valid invite.", done => {
		return done();
	});

	// Leave a campaign.
	it("User can leave a campaign", done => {
		fake("user").then(user => {
			fake("campaign", 1, {
				Private: true,
				Password: gh("fishstick")
			}).then(campaign => {
				fake("token", 1, {
					userId: user._id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.delete("/campaign/" + campaign._id)
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							done();
						});
				});
			});
		});
	});

	// Admin CRUD.
	// ToDo: All crud actions.
});

after(done => {
	purge("campaign");
	done();
});