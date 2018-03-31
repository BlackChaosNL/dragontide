const app = require("../app");
const assert = require("chai").assert;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");

before(done => {
	purge("user");
});

describe("Test auth endpoint", () => {
	it("Can register a player to the service", done => {
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

	it("An active user can login to the service", done => {
		fake("user").then(users => {
			request(app)
				.post("/auth/login")
				.send({
					email: users[0].email,
					password: users[0].password
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					assert.isTrue(res.body.ok);
					assert.isString(res.body.message);
					done();
				});
		});
	});

	it("Wrong credentials gets caught by the system and refuses to login", done => {
		fake("user").then(users => {
			request(app)
				.post("/auth/login")
				.send({
					email: users[0].email,
					password: users[0].password + "X"
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					assert.isFalse(res.body.ok);
					assert.equal(res.body.message, "The username or password was not correct, please try again.");
					done();
				});
		});
	});

	it("An active user can logout from the service", done => {
		fake("user").then(user => {
			fake("token", 1, {
				userId: user.id,
				expires: new Date().setDate(new Date().getDate() + 1),
			}).then(token => {
				request(app)
					.get("/auth/logout")
					.set('Authorization', 'Bearer ' + token[0].token)
					.expect(200)
					.end((err, res) => {
						if (err) return done(err);
						assert.isTrue(res.body.ok);
						done();
					});
			}).catch(err => done(err));
		}).catch(err => done(err));
	});
});

after(done => {
	mongoose.connection.close(done);
});
