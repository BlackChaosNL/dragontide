const dist = require("../package.json");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     description: Show API status
 *     produces: application/json
 *     response:
 *       200:
 *         description: A JSON object
 */
router.get('/', (req, res, next) => res.json({"ok": true, "version": dist.version}));

module.exports = router;
