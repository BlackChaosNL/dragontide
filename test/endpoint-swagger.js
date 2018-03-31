const app = require("../app");
const assert = require("chai").assert;
const expect = require("chai").expect;
const config = require("../config/app");
const fake = require("../lib/fake");
const mongoose = require("mongoose");
const request = require("supertest");
const purge = require("../lib/purge-collection");

describe("Test swagger endpoint", () => {
	it("Swagger endpoint is available when service starts.", done => {
		request(app)
			.get("/swagger.json")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				assert.isObject(res.body.info);
				done();
			});
	});
});