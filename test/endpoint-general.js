const app = require("../app");
const assert = require("chai").assert;
const expect = require("chai").expect;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");

describe("Test general endpoint", () => {
	it("404 is thrown when route is not found.", done => {
		request(app)
			.get("/aisjduioasjodijasiodj")
			.expect(404)
			.end((err, res) => {
				if (err) return done(err);
				//
				done();
			});
	});
});