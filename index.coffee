extend = require 'node.extend'

module.exports = (str, opt) ->
	pattern = ///
		(?:\s*)
		(?:class)
		(?:\s+)
		(\w+)
		(?:\s+)
		(?:extends)
		(?:\s+)
		(?=Config|Constant|Controller|Directive|Factory|Filter|Provider|Run|Service|Value)
		(\w*)
		(?:\s+)
		(
			(?:constant)
			(?:\s*)
			(?:\:)
			|
			(?:value)
			(?:\s*)
			(?:\:)
			|
			(?:constructor)
			(?:\s*)
			(?:\:)
			(?:\s*)
			([^\r\n]+)
			(?=\s*->)
		)
	///

	removePattern = ///
		(\s+extends\s\w*)
	///

	options =
		appName: 'app'
		formats:
			config: "angular.module('{{a}}').{{t|l}} [{{p}}]"
			constant: "angular.module('{{a}}').{{t|l}} '{{c|u}}', {{p}}::constant"
			controller: "angular.module('{{a}}').{{t|l}} '{{c|c}}{{t}}', [{{p}}]"
			directive: "angular.module('{{a}}').{{t|l}} '{{c|c}}', [{{p}}]"
			factory: "angular.module('{{a}}').{{t|l}} '{{c}}', [{{p}}]"
			filter: "angular.module('{{a}}').{{t|l}} '{{c|c}}', [{{p}}]"
			provider: "angular.module('{{a}}').{{t|l}} '{{c|c}}{{t}}', [{{p}}]"
			run: "angular.module('{{a}}').{{t|l}} [{{p}}]"
			service: "angular.module('{{a}}').{{t|l}} '{{c|c}}{{t}}', [{{p}}]"
			value: "angular.module('{{a}}').{{t|l}} '{{c|c}}', {{p}}::value"

	extend options, opt

	getModule = (details) ->
		format = options.formats[details.t.toLowerCase()]
		parts = format.split /{{(.*?)}}/
		compiled = []

		parts.forEach (part) ->
			filters = part.split '|'
			component = filters[0]
			detail = details[component]

			if component is 'p'
				joined = detail.join '\', \''
				detail = if joined.length > 0 then '\'' + joined + '\'' + ', ' + details.c else details.c
				filters = filters.filter (filter, i) -> i > 0

			for filter in filters when filters.length isnt 1
				switch filter
					when 'l' then detail = detail.toLowerCase()
					when 'u' then detail = detail.toUpperCase()
					when 'c' then detail = detail.charAt(0).toLowerCase() + detail.slice(1)

			compiled.push if detail then detail else component

		module = compiled.join ''

	matches = str.split pattern
	a = options.appName
	c = matches[1]
	t = matches[2]
	p = if matches[4] then matches[4].replace('(', '').replace(')', '').replace(/\s*/g, '').replace(/@/g, '').split(',') else []
	details = {a, t, c, p}
	module = getModule details
	trimmedContents = str.replace removePattern, ''
	output = "#{trimmedContents}\n\n#{module}"