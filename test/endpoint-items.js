const app = require("../app");
const assert = require("chai").assert;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");

describe("Test items route", () => {
	it("Returns a list of existing items", done => {
		purge("item")
			.then(() => {
				return fake("item", 20);
			})
			.then(items => {
				request(app)
					.get("/items")
					.expect(200)
					.end((err, res) => {
						if (err) throw err;

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 20);
					});
			})
			.catch(err => done(err));
	});

	it("Returns a second page of items", done => {
		purge("item")
			.then(() => {
				return fake("item", 40);
			})
			.then(items => {
				request(app)
					.get("/items?page=2")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 10);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("Items can be filtered by name", done => {
		purge("item")
			.then(() => {
				return fake("item", 1, {
					name: "Test",
				});
			})
			.then(items => {
				return items.push(fake("item", 1, {
					name: "Other Test",
				}));
			})
			.then(items => {
				return items.push(fake("item", 1, {
					name: "Unrelated",
				});
			})
			.then(items => {
				request(app)
					.get("/items")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 3);
					});

				return items;
			})
			.then(items => {
				request(app)
					.get("/items?name=test")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 2);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("Items can be filtered by description", done => {
		purge("item")
			.then(() => {
				return fake("item", 1, {
					description: "This is a test items",
				});
			})
			.then(items => {
				return items.push(fake("item", 1, {
					name: "Yet another item used for testing. Not very interesting.",
				}));
			})
			.then(items => {
				return items.push(fake("item", 1, {
					name: "ITS THE SWORD OF A THOUSAND FUCKING TRUTHS OH SHIT",
				});
			})
			.then(items => {
				request(app)
					.get("/items")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 3);
					});

				return items;
			})
			.then(items => {
				request(app)
					.get("/items?description=test")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 2);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("Items can be filtered by stats", done => {
		purge("item")
			.then(() => {
				return fake("item", 1, {
					stats: {
						strength: 1
					}
				});
			})
			.then(items => {
				return items.push(fake("item", 1, {
					stats: {
						strength: 1
					}
				}));
			})
			.then(items => {
				return items.push(fake("item", 1, {
					stats: {
						wisdom: 2
					}
				});
			})
			.then(items => {
				request(app)
					.get("/items")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 3);
					});

				return items;
			})
			.then(items => {
				request(app)
					.get("/items?stats=strength")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.items);
						assert.equal(res.body.items.length, 2);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("can create a new item", done => {
		request(app)
			.post("/items")
			.send({
				name: "Sword of a Thousand Truths",
				type: "Sword",
				description: "Quite possibly the strongest item known to the universe",
				weight: 30,
				stats: {
					strength: 100,
					dexterity: 100,
					constitution: 100,
					intelligence: 100,
					wisdom: 100,
					charisma: -5,
				},
				additional: "Feedback: 100% of damage dealt also burns mana.",
			})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);

				assert.isTrue(res.body.ok);
				assert.isOk(res.body.item);
				assert.equal(res.body.item.name, "Sword of a Thousand Truths");
				assert.equal(res.body.item.stats.strength, 100);
				assert.equal(res.body.item.stats.charisam, -5);

				done();
			});
	});

	it("can create a new item from an existing item", done => {
		purge("item")
			.then(() => {
				return fake("item", 1, {
					stats: {
						strength: 1
					}
				});
			})
			.then(items => {
				request(app)
					.post("/items?base=" + items[0].id)
					.send({
						name: "Sword of a Thousand Lies",
						type: "Sword",
						description: "Quite possibly the weakest item known to the universe",
						weight: 40,
						stats: {
							dexterity: -100,
							constitution: -100,
							intelligence: -100,
							wisdom: -100,
							charisma: -5,
						},
						additional: "Feedback: 100% of damage dealt also restores mana to the enemy.",
					})
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.item);
						assert.equal(res.body.item.name, "Sword of a Thousand Lies");
						assert.equal(res.body.item.stats.strength, 1);
						assert.equal(res.body.item.stats.wisdom, -100);
						assert.equal(res.body.item.stats.charisam, -5);

						done();
					});
			});
	});
});
