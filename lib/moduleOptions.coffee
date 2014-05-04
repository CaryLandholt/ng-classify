extend = require 'node.extend'

module.exports = (formatOptions, options) ->
	moduleOptions =
		appName: 'app'
		formats:
			animation: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.animation.prefix}{{className|#{formatOptions.animation.format}}}#{formatOptions.animation.suffix}', [{{parameters}}]"
			app: "angular.module '{{appName}}', {{parameters}}.constructor"
			config: "angular.module('{{appName}}').{{moduleType|lowerCase}} [{{parameters}}]"
			constant: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.constant.prefix}{{className|#{formatOptions.constant.format}}}#{formatOptions.constant.suffix}', {{parameters}}.constructor"
			controller: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.controller.prefix}{{className|#{formatOptions.controller.format}}}#{formatOptions.controller.suffix}', [{{parameters}}]"
			directive: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.directive.prefix}{{className|#{formatOptions.directive.format}}}#{formatOptions.directive.suffix}', [{{parameters}}]"
			factory: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.factory.prefix}{{className|#{formatOptions.factory.format}}}#{formatOptions.factory.suffix}', [{{parameters}}]"
			filter: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.filter.prefix}{{className|#{formatOptions.filter.format}}}#{formatOptions.filter.suffix}', [{{parameters}}]"
			provider: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.provider.prefix}{{className|#{formatOptions.provider.format}}}#{formatOptions.provider.suffix}', [{{parameters}}]"
			run: "angular.module('{{appName}}').{{moduleType|lowerCase}} [{{parameters}}]"
			service: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.service.prefix}{{className|#{formatOptions.service.format}}}#{formatOptions.service.suffix}', [{{parameters}}]"
			value: "angular.module('{{appName}}').{{moduleType|lowerCase}} '#{formatOptions.value.prefix}{{className|#{formatOptions.value.format}}}#{formatOptions.value.suffix}', {{parameters}}.constructor"
		prefix: ''

	merged = extend true, moduleOptions, options