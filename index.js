// This file is a simple bridge since gulp doesn't support CoffeeScript configurations natively.

require('coffee-script').register();

module.exports = require('./index.coffee');