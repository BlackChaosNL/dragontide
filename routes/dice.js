const express = require('express');
const router = express.Router();
const dice = require("../lib/dice");

router.get('/', (req, res, next) => {
	res.json({"ok": true, "value": dice.rollOne(20)})
});

router.get('/:sides', (req, res, next) => {
	res.json({"ok": true, "value": dice.rollOne(req.params.sides)})
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
