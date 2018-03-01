const app = require("../app");
const assert = require("chai").assert;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");

describe("Test characters route", () => {
	it("Returns a list of existing characters", done => {
		purge("character")
			.then(() => {
				return fake("character", 30);
			})
			.then(characters => {
				request(app)
					.get("/characters")
					.expect(200)
					.end((err, res) => {
						if (err) throw err;

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.characters);
						assert.equal(res.body.characters.length, 30);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("Returns a second page of existing characters", done => {
		purge("character")
			.then(() => {
				return fake("character", 40);
			})
			.then(characters => {
				request(app)
					.get("/characters?page=2")
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.characters);
						assert.equal(res.body.characters.length, 10);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("Returns a single character", done => {
		fake("character")
			.then(character => {
				request(app)
					.get("/characters/" + character._id)
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.character);
						assert.equal(res.body.character.name, character.name);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("Returns 404 when requesting a non-existing character", done => {
		request(app)
			.get("/characters/no")
			.expect(404)
			.end((err, res) => {
				if (err) return done(err);

				assert.isFalse(res.body.ok);

				done();
			});
	});

	it("Creates a new character", done => {
		request(app)
			.post("/characters")
			.send({
				name: "Henk de Testfreak",
				stats: {
					strength: 8,
					dexterity: 9,
					constitution: 10,
					intelligence: 11,
					wisdom: 12,
					charisma: 13,
				},
			})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);

				assert.isTrue(res.body.ok);
				assert.isOk(res.body.character);
				assert.equal(res.body.character.name, "Henk de Testfreak");

				done();
			});
	});

	it("Updates a character", done => {
		fake("character")
			.then(character => {
				const defaultStrength = character.stats.strength;

				request(app)
					.patch("/characters/" + character._id)
					.send({
						stats: {
							strength: defaultStrength + 2,
						},
					})
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);

						assert.isTrue(res.body.ok);
						assert.isOk(res.body.character);
						assert.equal(res.body.character.stats.strength, defaultStrength + 2);

						done();
					});
			})
			.catch(err => done(err));
	});

	it("Returns 404 when trying to update a non-existing character", done => {
		request(app)
			.patch("/characters/no")
			.send({
				stats: {
					strength: 2,
				},
			})
			.expect(404)
			.end((err, res) => {
				if (err) return done(err);

				assert.isFalse(res.body.ok);

				done();
			});
	});
});

after(done => {
	mongoose.connection.close(done);
});
