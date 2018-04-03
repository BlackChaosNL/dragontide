const Item = require("../models/item");
const express = require("express");
const itemTypes = require("../models/item-type");
const merge = require("merge");
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
 *       404:
 *         description: The base item could not be found
 */
router.post("/", (req, res, next) => {
	getBaseItem(req.query.base || 0)
		.then(data => {
			return merge.recursive(true, data, req.body);
		}).then(data => {
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

			return data;
		})
		.then(data => {
			return Item(data);
		})
		.then(item => {
			item.save(err => {
				if (err) {
					throw err;
				}

				return res.json({
					ok: true,
					item: item,
				});
			});
		})
		.catch(err => res.json({ok: false, err: err}));
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     description: Get info about a single item
 *     produces: application/json
 *     response:
 *       200:
 *         description: The full data of a single item
 *       404:
 *         description: The item was not found
 */
router.get("/:id", (req, res, next) => {
	Item.findById(req.params.id, (err, item) => {
		if (err) {
			return res.status(404)
				.json({
					ok: false,
					error: err,
				});
		}

		return res.json({
			ok: true,
			item: item,
		});
	});
});

function getBaseItem(id)
{
	if (!id) {
		return new Promise((resolve, reject) => {
			return resolve({});
		});
	}

	return Item.findById(id, (err, item) => {
		if (err) {
			throw err;
		}

		return item;
	}).then(item => {
		// Parse to a clean JSON object
		const object = JSON.parse(JSON.stringify(item));

		// Remove garbage fields
		delete object.__v;
		delete object._id;

		return object;
	});
}

module.exports = router;
