test:
	node_modules/.bin/jshint --verbose {bin,config,fakers,lib,models,routes,test,app.js}
	APP_ENV=test node_modules/.bin/mocha

.PHONY: test
