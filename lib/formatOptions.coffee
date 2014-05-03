extend = require 'node.extend'

module.exports = (opt) ->
	options =
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
	for k, v of options
		prefix = options[k].prefix
		suffix = options[k].suffix
		options[k].prefix = '' if !prefix
		options[k].suffix = '' if !suffix

	merged = extend true, options, opt