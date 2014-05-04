extend = require 'node.extend'

module.exports = (options) ->
	formatOptions =
		animation:
			format: 'spinalCase'
			prefix: '.'
		constant:
			format: 'screamingSnakeCase'
		controller:
			format: 'camelCase'
			suffix: 'Controller'
		directive:
			format: 'camelCase'
		factory:
			format: 'upperCamelCase'
		filter:
			format: 'camelCase'
		provider:
			format: 'camelCase'
			suffix: 'Provider'
		service:
			format: 'camelCase'
			suffix: 'Service'
		value:
			format: 'camelCase'

	# add empty prefix and suffix if not supplied
	for k, v of formatOptions
		prefix                  = formatOptions[k].prefix
		suffix                  = formatOptions[k].suffix
		formatOptions[k].prefix = '' if !prefix
		formatOptions[k].suffix = '' if !suffix

	merged = extend true, formatOptions, options