const Character = require("../models/character");
const express = require('express');
const pc = require("../lib/param-check");
const router = express.Router();

/**
 * @swagger
 * /characters:
 *   get:
 *     description: Get a list of characters
 *     produces: application/json
 *     response:
 *       200:
 *         description: A list of 30 characters
 */
router.get("/", (req, res, next) => {
	// It should be noted that .skip isn't very scalable:
	// https://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js
	const skip = ((req.query.page || 1) - 1) * 30;
	const query = Character.find({}).limit(30).skip(skip);

	query.exec((err, characters) => {
		if (err) {
			throw err;
		}

		return res.json({
			ok: true,
			characters: characters,
		});
	});
});

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     description: Get info about a single character
 *     produces: application/json
 *     response:
 *       200:
 *         description: The full data of a single character
 *       404:
 *         description: The character was not found
 */
router.get("/:id", (req, res, next) => {
	Character.findById(req.params.id, (err, character) => {
		if (err) {
			return res.status(404)
				.json({
					ok: false,
					error: err,
				});
		}

		return res.json({
			ok: true,
			character: character,
		});
	});
});

/**
 * @swagger
 * /characters/{id}:
 *   delete:
 *     description: Remove an existing character
 *     produces: application/json
 *     response:
 *       200:
 *         description: The character has been removed
 *       404:
 *         description: The character was not found
 */
router.delete("/:id", (req, res, next) => {
	Character.findByIdAndRemove(req.params.id, err => {
		if (err) {
			return res.status(404)
				.json({
					ok: false,
					error: err,
				});
		}

		return res.json({
			ok: true,
		});
	});
});

/**
 * @swagger
 * /characters/{id}:
 *   patch:
 *     description: Update parts of a character
 *     produces: application/json
 *     response:
 *       200:
 *         description: The character has been updated
 *       404:
 *         description: The character was not found
 */
router.patch("/:id", (req, res, next) => {
	const data = req.body;

	// Find the character
	Character.findById(req.params.id, (err, character) => {
		if (err) {
			return res.status(404)
				.json({
					ok: false,
					error: err,
				});
		}

		// Update the stats
		[
			"strength",
			"dexterity",
			"constitution",
			"intelligence",
			"wisdom",
			"charisma"
		].forEach(stat => {
			if (data.stats[stat]) {
				pc(data.stats[stat], x => 0 < x, stat + " must be positive, if given");

				character.stats[stat] = data.stats[stat];
			}
		});

		// Save the updated model
		character.save(err => {
			if (err) {
				throw err;
			}

			return res.json({
				ok: true,
				character: character,
			});
		});
	});
});

/**
 * @swagger
 * /characters:
 *   post:
 *     description: Add a new character
 *     produces: application/json
 *     response:
 *       200:
 *         description: The new character was created succesfully
 */
router.post("/", (req, res, next) => {
	const data = req.body;

	// Validate the request
	pc(data.name, x => x.match(/\w{3,}/), "A name of at least 3 characters must be given");
	pc(data.stats.strength, x => 0 < x, "Strength must be higher than 0");
	pc(data.stats.dexterity, x => 0 < x, "Dexterity must be higher than 0");
	pc(data.stats.constitution, x => 0 < x, "Constitution must be higher than 0");
	pc(data.stats.intelligence, x => 0 < x, "Intelligence must be higher than 0");
	pc(data.stats.wisdom, x => 0 < x, "Wisdom must be higher than 0");
	pc(data.stats.charisma, x => 0 < x, "Charisma must be higher than 0");

	// Create the new Character
	const character = Character({
		name: data.name,
		level: 1,
		stats: {
			strength: data.stats.strength,
			dexterity: data.stats.dexterity,
			constitution: data.stats.constitution,
			intelligence: data.stats.intelligence,
			wisdom: data.stats.wisdom,
			charisma: data.stats.charisma,
		}
	});

	// Save the character in the database
	character.save(err => {
		if (err) {
			throw err;
		}

		return res.json({
			ok: true,
			character: character,
		});
	});
});

module.exports = router;
