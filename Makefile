bindir = node_modules/.bin
jshint = $(bindir)/jshint
mocha  = $(bindir)/mocha

test: static unit

static:
	$(jshint) --verbose app.js
	$(jshint) --verbose bin
	$(jshint) --verbose config
	$(jshint) --verbose fakers
	$(jshint) --verbose lib
	$(jshint) --verbose models
	$(jshint) --verbose routes
	$(jshint) --verbose test

unit:
	APP_ENV=test $(bindir)/nyc $(bindir)/mocha

.PHONY: test
