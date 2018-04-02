const Item = require("../models/item");
const express = require("express");
const router = express.Route();

/**
 * @swagger
 * /items:
 *   get:
 *     description: Get a list of items
 *     produces: application/json
 *     response:
 *       200:
 *         description: A list of 30 items
 */
router.get("/", (req, res, next) => {
	const skip = ((req.query.page || 1) - 1) * 30;
	const query = Item.find({}).limit(30).skip(skip);

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
