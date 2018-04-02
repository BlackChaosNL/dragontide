const Item = require("../models/item");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /items:
 *   get:
 *     description: Get a list of items
 *     response:
 *       200:
 *         description: A list of 30 items
 */
router.get("/", (req, res, next) => {
	const skip = ((req.query.page || 1) - 1) * 30;
	const query = Item.find({}).limit(30).skip(skip);

	if (req.query.name) {
		query.where("name", new RegExp(req.query.name, "i"));
	}

	if (req.query.description) {
		query.where("description", new RegExp(req.query.description, "i"));
	}

	statTypes = [
		"strength",
		"dexterity",
		"constitution",
		"intelligence",
		"wisdom",
		"charisma",
	].forEach(s => {
		if (req.query[s]) {
			query.where("stats." + s).gt(req.query[s]);
		}
	});

	query.exec((err, items) => {
		if (err) {
			throw err;
		}

		return res.json({
			ok: true,
			items: items,
		});
	});
});

module.exports = router;
