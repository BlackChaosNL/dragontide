const app = require("../app");
const assert = require("chai").assert;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");

before(done => {
	purge("user").then(result => {
		done();
	});
});

describe("Test auth endpoint", () => {
	it("Invalid registration can be caught.", done => {
		request(app)
			.post("/auth/register")
			.send({
				email: "test@test.xs",
				password: "Testtesttest"
			})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isFalse(res.body.ok);
				assert.isString(res.body.message);
				done();
			});
	});

	it("Can register a player to the service.", done => {
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

	it("Duplicate player can not register again.", done => {
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
				assert.isFalse(res.body.ok);
				assert.isString(res.body.message);
				done();
			});
	});

	it("A player can not forget an E-Mail address or Password while logging in.", done => {
		request(app)
			.post("/auth/login")
			.send({})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isFalse(res.body.ok);
				assert.isString(res.body.message);
				done();
			});
	});

	it("An active user can login to the service.", done => {
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
				assert.isString(res.body.message);
				done();
			});
	});

	it("Wrong credentials gets caught by the system and refuses to login.", done => {
		request(app)
			.post("/auth/login")
			.send({
				email: "test@test.xs",
				password: "TesttesttestXXXX"
			})
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isFalse(res.body.ok);
				assert.isString(res.body.message);
				done();
			});
	});

	it("An active user can logout from the service.", done => {
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

	it("A non logged in user can not logout.", done => {
		request(app)
			.get("/auth/logout")
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);
				assert.isFalse(res.body.ok);
				assert.isString(res.body.message);
				done();
			});
	});
});

after(done => {
	mongoose.connection.close(done);
});