changeCase = require './changeCase'

module.exports = (input, filters) ->
	input = changeCase input, filter for filter in filters

	input