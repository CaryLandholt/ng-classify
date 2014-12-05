extend = require 'node.extend'

module.exports = (formatOptions, options) ->
	moduleOptions =
		appName: 'app'
		formats:
			animation: ".{{moduleType|lowerCase}}('#{formatOptions.animation.prefix}{{className|#{formatOptions.animation.format}}}#{formatOptions.animation.suffix}', [{{parameters}}])"
			app: "angular.module('{{appName}}', new {{className}}())"
			config: ".{{moduleType|lowerCase}}([{{parameters}}])"
			constant: ".{{moduleType|lowerCase}}('#{formatOptions.constant.prefix}{{className|#{formatOptions.constant.format}}}#{formatOptions.constant.suffix}', {{className}}())"
			controller: ".{{moduleType|lowerCase}}('#{formatOptions.controller.prefix}{{className|#{formatOptions.controller.format}}}#{formatOptions.controller.suffix}', [{{parameters}}])"
			directive: ".{{moduleType|lowerCase}}('#{formatOptions.directive.prefix}{{className|#{formatOptions.directive.format}}}#{formatOptions.directive.suffix}', [{{parameters}}])"
			factory: ".{{moduleType|lowerCase}}('#{formatOptions.factory.prefix}{{className|#{formatOptions.factory.format}}}#{formatOptions.factory.suffix}', [{{parameters}}])"
			filter: ".{{moduleType|lowerCase}}('#{formatOptions.filter.prefix}{{className|#{formatOptions.filter.format}}}#{formatOptions.filter.suffix}', [{{parameters}}])"
			provider: ".{{moduleType|lowerCase}}('#{formatOptions.provider.prefix}{{className|#{formatOptions.provider.format}}}#{formatOptions.provider.suffix}', [{{parameters}}])"
			run: ".{{moduleType|lowerCase}}([{{parameters}}])"
			service: ".{{moduleType|lowerCase}}('#{formatOptions.service.prefix}{{className|#{formatOptions.service.format}}}#{formatOptions.service.suffix}', [{{parameters}}])"
			value: ".{{moduleType|lowerCase}}('#{formatOptions.value.prefix}{{className|#{formatOptions.value.format}}}#{formatOptions.value.suffix}', {{className}}())"
		prefix: ''

	merged = extend true, moduleOptions, options