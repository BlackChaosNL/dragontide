const dist = require("../package.json");
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => res.json({"ok": true, "version": dist.version}));

module.exports = router;
