const Item = require("../models/item");
const express = require("express");
const itemTypes = require("../models/item-type");
const pc = require("../lib/param-check");
const router = express.Router();
const statTypes = require("../models/stat-type");

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

	statTypes.forEach(s => {
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

/**
 * @swagger
 * /items:
 *   post:
 *     description: Add a new item
 *     produces: application/json
 *     response:
 *       200:
 *         description: The new item was created succesfully
 */
router.post("/", (req, res, next) => {
	const data = req.body;

	pc(data.name, x => x.match(/\w+/), "Item name is required");
	pc(data.type, x => itemTypes.includes(x), "Item type is required");
	pc(data.weight, x => 0 < x, "Item weight is required");

	if (!data.description) {
		data.description = "";
	}

	if (!data.additional) {
		data.additional = "";
	}

	if (!data.stats) {
		data.stats = {};
	}

	statTypes.forEach(s => {
		if (!data.stats[s]) {
			data.stats[s] = 0;
		}
	});

	// Create the new Item
	const item = Item(data);

	// Save the item in the database
	item.save(err => {
		if (err) {
			throw err;
		}

		return res.json({
			ok: true,
			item: item,
		});
	});
});

module.exports = router;
