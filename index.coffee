extend = require 'node.extend'

module.exports = (str, opt) ->
	options =
		appName: 'app'
		extendsPattern: ///
			(\s+extends\s\w*)
		///
		formats:
			animation: "angular.module('{{appName}}').{{moduleType|lowerCase}} '.{{className|hyphen|lowerCase}}', [{{parameters}}]"
			config: "angular.module('{{appName}}').{{moduleType|lowerCase}} [{{parameters}}]"
			constant: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|underscore|upperCase}}', {{parameters}}.constructor"
			controller: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|camelCase}}{{moduleType}}', [{{parameters}}]"
			directive: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|camelCase}}', [{{parameters}}]"
			factory: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className}}', [{{parameters}}]"
			filter: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|camelCase}}', [{{parameters}}]"
			provider: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|camelCase}}{{moduleType}}', [{{parameters}}]"
			run: "angular.module('{{appName}}').{{moduleType|lowerCase}} [{{parameters}}]"
			service: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|camelCase}}{{moduleType}}', [{{parameters}}]"
			value: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|camelCase}}', {{parameters}}.constructor"
		pattern: ///
			(?:\s*)
			(?:class)
			(?:\s+)
			(\w+)
			(?:\s+)
			(?:extends)
			(?:\s+)
			(?=Animation|Config|Constant|Controller|Directive|Factory|Filter|Provider|Run|Service|Value)
			(\w*)
			(?:\s+)
			(
				(?:@constructor)
				(?:\s*)
				(?:\=)
				|
				(?:constructor)
				(?:\s*)
				(?:\:)
				(?:\s*)
				([^\r\n]+)
				(?=\s*->)
			)
		///

	extend options, opt

	getModule = (details) ->
		format = options.formats[details.moduleType.toLowerCase()]
		parts = format.split /{{(.*?)}}/
		compiled = []

		parts.forEach (part) ->
			filters = part.split '|'
			component = filters[0]
			detail = details[component]

			if component is 'parameters'
				joined = detail.join '\', \''
				detail = if joined.length > 0 then '\'' + joined + '\'' + ', ' + details.className else details.className
				filters = filters.filter (filter, i) -> i > 0

			for filter in filters when filters.length isnt 1
				switch filter
					when 'camelCase' then detail = detail.charAt(0).toLowerCase() + detail.slice(1)
					when 'hyphen' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1-$2')
					when 'lowerCamelCase' then detail = detail.charAt(0).toLowerCase() + detail.slice(1)
					when 'lowerCase' then detail = detail.toLowerCase()
					when 'underscore' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1_$2')
					when 'upperCamelCase' then detail = detail.charAt(0).toUpperCase() + detail.slice(1)
					when 'upperCase' then detail = detail.toUpperCase()
					

			compiled.push if detail then detail else component

		module = compiled.join ''

	matches = str.split options.pattern
	appName = options.appName
	className = matches[1]
	moduleType = matches[2]
	parameters = if matches[4] then matches[4].replace('(', '').replace(')', '').replace(/\s*/g, '').replace(/@/g, '').split(',') else []
	details = {appName, moduleType, className, parameters}
	module = getModule details
	trimmedContents = str.replace options.extendsPattern, ''
	output = "#{trimmedContents}\n\n#{module}"