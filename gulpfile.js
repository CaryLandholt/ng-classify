// the build instructions are in gulpfile.coffee
// this file is a simple bridge since gulp doesn't support
// CoffeeScript files natively.

require('./node_modules/coffee-script/register');
require('./gulpfile.coffee');