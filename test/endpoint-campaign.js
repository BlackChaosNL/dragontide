const app = require("../app");
const assert = require("chai").assert;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");
const gh = require("../lib/generate-hash");
const random = require("randomstring");

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
				userId: user.id,
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
			}).catch((err) => {
				return done(err);
			});
		}).catch((err) => {
			return done(err);
		});
	});

	// Get pagination of campaign list.
	it("User can get page two of active campaigns.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
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
			}).catch((err) => {
				return done(err);
			});
		}).catch((err) => {
			return done(err);
		});
	});

	// User can get a campaign
	it("User can get details from a campaign.", done => {
		fake("user").then(user => {
			fake("campaign").then(campaign => {
				fake("token", 1, {
					userId: user.id,
					expires: new Date().setDate(new Date().getDate() + 1),
				}).then(tokens => {
					request(app)
						.get("/campaign/" + campaign._id)
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.expect(200)
						.end((err, res) => {
							if (err) return done(err);
							assert.isTrue(res.body.ok);
							assert.isObject(res.body.campaign);
							done();
						});
				}).catch((err) => {
					return done(err);
				});
			}).catch((err) => {
				return done(err);
			});
		}).catch((err) => {
			return done(err);
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
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				request(app)
					.post("/campaign/")
					.set('Authorization', 'Bearer ' + tokens[0].token)
					.send({
						name: "Vistastische Campaign!",
						description: "We will fuck the fish up!"
					})
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						assert.isObject(res.body.campaign);
						done();
					});
			}).catch((err) => {
				return done(err);
			});
		}).catch((err) => {
			return done(err);
		});
	});

	// Private.
	it("User can create their own private campaign.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				request(app)
					.post("/campaign/")
					.set('Authorization', 'Bearer ' + tokens[0].token)
					.send({
						name: "Vistastische Campaign!",
						description: "We will fuck the fish up!",
						password: "Fish"
					})
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						assert.isObject(res.body.campaign);
						done();
					});
			}).catch((err) => {
				return done(err);
			});
		}).catch((err) => {
			return done(err);
		});
	});

	// Campaign can be altered when required by the DM.
	// put
	it("GM can alter their own campaign. (Put)", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: true,
					password: gh("fishstick")
				}).then(campaign => {
					request(app)
						.put("/campaign/" + campaign[0]._id)
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
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: true,
					password: gh("fishstick")
				}).then(campaign => {
					request(app)
						.patch("/campaign/" + campaign[0]._id)
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
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: false,
					password: ''
				}).then(campaign => {
					request(app)
						.post("/campaign/" + campaign[0]._id + "/join")
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
	it("User can not join a private campaign with a wrong password.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: true,
					password: gh("alpacasso")
				}).then(campaign => {
					request(app)
						.post("/campaign/" + campaign[0]._id + "/join")
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.send({
							password: "Alpicasso"
						})
						.expect(401)
						.end((err, res) => {
							if (err) return done(err);
							assert.isFalse(res.body.ok);
							done();
						});
				});
			});
		});
	});

	// Right password.
	it("User can join a private campaign with a right password.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: true,
					password: "alpacasso"
				}).then(campaign => {
					request(app)
						.post("/campaign/" + campaign[0]._id + "/join")
						.set('Authorization', 'Bearer ' + tokens[0].token)
						.send({
							password: "alpacasso"
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
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: true,
					password: gh("alpacasso")
				}).then(campaign => {
					fake("campaign-players", 1, {
						campaignId: campaign[0]._id,
						userId: user.id,
						joinedAt: new Date(Date.now())
					}).then(cplayers => {
						fake("invite", 1, {
							invite: random.generate(60),
							campaignId: campaign[0]._id,
							invitedBy: user.id,
							expires: new Date().setHours(new Date().getHours() + (24 * 7))
						}).then(inv => {
							request(app)
								.post("/campaign/invite")
								.set('Authorization', 'Bearer ' + tokens[0].token)
								.send({
									invite: inv[0].invite + "X"
								})
								.expect(404)
								.end((err, res) => {
									if (err) return done(err);
									assert.isFalse(res.body.ok);
									return done();
								});
						});
					});
				});
			});
		});
		// return done();
	});

	// Active
	it("User can join an invited campaign with a valid invite.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: true,
					password: gh("alpacasso")
				}).then(campaign => {
					const campaignId = campaign[0]._id;

					fake("campaign-players", 1, {
						campaignId: campaignId,
						userId: user.id,
						joinedAt: new Date(Date.now())
					}).then(cplayers => {
						fake("invite", 1, {
							invite: random.generate(60),
							campaignId: campaignId,
							invitedBy: user.id,
							expires: new Date().setHours(new Date().getHours() + (24 * 7)),
							accepted: false,
							acceptedBy: ''
						}).then(inv => {
							request(app)
								.post("/campaign/invite")
								.set('Authorization', 'Bearer ' + tokens[0].token)
								.send({
									invite: inv[0].invite
								})
								.expect(200)
								.end((err, res) => {
									if (err) return done(err);

									assert.isTrue(res.body.ok);

									return done();
								});
						});
					});
				});
			});
		});
	});

	// DM can remove game.
	it("DM can delete their own campaign.", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(tokens => {
				fake("campaign", 1, {
					title: "Visstick",
					description: "We are the champions",
					dm: user.id,
					active: true,
					private: true,
					password: gh("fishstick")
				}).then(c => {
					request(app)
						.delete("/campaign/" + c[0]._id)
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
