var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const swagger = require("swagger-jsdoc");
const dist = require("./package.json");
const mongoose = require("mongoose");
const config = require("./config/app.js");
const cors = require("cors");

var app = express();

// Connect to the database
mongoose.connect("mongodb://" + config.db.host + "/" + config.db.collection);

// Add Swagger
const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: dist.name,
			version: dist.version,
			description: dist.description || "Nondescript",
		},
		host: "localhost:3000",
		basePath: "/",
	},
	apis: [
		"routes/*.js"
	],
};

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Show requests
if (config.logging.requests) {
	app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require("./middleware/authentication"));

app.use("/swagger.json", (req, res, next) => {
	res.json(swagger(swaggerOptions));
});

// Load all routes
app.use('/', require("./routes/index"));
app.use("/dice", require("./routes/dice"));
app.use("/characters", require("./routes/characters"));
app.use("/items", require("./routes/items"));
app.use("/auth", require("./routes/auth"));
app.use("/campaign", require("./routes/campaign"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	const message = err.message || err;

	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.json({
		"ok": false,
		"message": message,
	});
});

module.exports = app;
