const express = require('express');
const router = express.Router();
const dice = require("../lib/dice");

/**
 * @swagger
 * /dice:
 *   get:
 *     description: Roll 1d20
 *     produces: application/json
 *     response:
 *       200:
 *         description: A random number between 1 and 20, inclusive.
 */
router.get('/', (req, res, next) => {
	res.json({
		ok: true, 
		value: dice.rollOne(20),
	});
});

/**
 * @swagger
 * /dice/{sides}:
 *   get:
 *     description: Roll a die with the given number of sides, inclusive.
 *     responses:
 *       200:
 *         description: A random number between 1 and the given maximum.
 */
router.get('/:sides', (req, res, next) => {
	res.json({
		ok: true,
		value: dice.rollOne(req.params.sides),
	});
});

router.get('/:dice/:sides', (req, res, next) => {
	const set = dice.rollSet(req.params.dice, req.params.sides);
	const sum = set.reduce((a, b) => a + b, 0);

	res.json({
		"ok": true,
		"value": sum,
		"set": set,
	});
});

module.exports = router;
