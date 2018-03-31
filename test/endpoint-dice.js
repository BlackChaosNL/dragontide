const app = require("../app");
const assert = require("chai").assert;
const expect = require("chai").expect;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");


describe("Test dice endpoint", () => {
	it("Get a random number from a D20.", done => {
		request(app)
			.get("/dice")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isTrue(res.body.ok);
				expect(res.body.value).to.be.a('number');
				done();
			});
	});

	it("Get a random number from a D12.", done => {
		request(app)
			.get("/dice/12")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isTrue(res.body.ok);
				expect(res.body.value).to.be.a('number');
				done();
			});
	});

	it("Get a random number from eight D12s.", done => {
		request(app)
			.get("/dice/12/8")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isTrue(res.body.ok);
				expect(res.body.value).to.be.a('number');
				done();
			});
	});

});