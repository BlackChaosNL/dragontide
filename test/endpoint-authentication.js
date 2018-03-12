const app = require("../app");
const assert = require("chai").assert;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");

describe("Test auth endpoint", () => {
	it("Can register a player to the service", done => {
		purge("user")
			.then(() => {
				request(app)
					.post("/auth/register")
					.send({
						email: "test@test.xs",
						username: "testuser",
						password: "Testtesttest"
					})
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						done();
					});
			});
	});

	it("An active user can login to the service", done => {
		request(app)
			.post("/auth/login")
			.send({
				email: "test@test.xs",
				password: "Testtesttest"
			})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isTrue(res.body.ok);
				done();
			});
	});

	// it("An active user can logout from the service", done => {

	// });
});