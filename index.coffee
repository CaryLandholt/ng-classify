extend = require 'node.extend'

module.exports = (str, opt) ->
	options =
		appName: 'app'
		extendsPattern: ///
			(\s+extends\s\w*)
		///
		formats:
			animation: "angular.module('{{appName}}').{{moduleType|lowerCase}} '.{{className|spinalCase}}', [{{parameters}}]"
			config: "angular.module('{{appName}}').{{moduleType|lowerCase}} [{{parameters}}]"
			constant: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|screamingSnakeCase}}', {{parameters}}.constructor"
			controller: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|lowerCamelCase}}{{moduleType}}', [{{parameters}}]"
			directive: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|lowerCamelCase}}', [{{parameters}}]"
			factory: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className}}', [{{parameters}}]"
			filter: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|lowerCamelCase}}', [{{parameters}}]"
			provider: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|lowerCamelCase}}{{moduleType}}', [{{parameters}}]"
			run: "angular.module('{{appName}}').{{moduleType|lowerCase}} [{{parameters}}]"
			service: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|lowerCamelCase}}{{moduleType}}', [{{parameters}}]"
			value: "angular.module('{{appName}}').{{moduleType|lowerCase}} '{{className|lowerCamelCase}}', {{parameters}}.constructor"
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
					when 'lowerCamelCase' then detail = detail.charAt(0).toLowerCase() + detail.slice(1)
					when 'lowerCase' then detail = detail.toLowerCase()					
					when 'screamingSnakeCase' then detail.replace(/([a-z\d])([A-Z])/g, '$1_$2').toUpperCase()
					when 'snakeCase' then detail.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase()
					when 'spinalCase' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()
					when 'trainCase' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1-$2').charAt(0).toUpperCase() + detail.replace(/([a-z\d])([A-Z])/g, '$1-$2').slice(1)
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