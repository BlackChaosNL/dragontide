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
	APP_ENV=test node_modules/.bin/nyc node_modules/.bin/mocha && node_modules/.bin/nyc report --reporter=text-lcov | ./node_modules/.bin/coveralls

.PHONY: test
