module.exports = (details, options) ->
	format   = options.formats[details.moduleType.toLowerCase()]
	parts    = format.split /{{(.*?)}}/
	compiled = []

	parts.forEach (part) ->
		filters   = part.split '|'
		component = filters[0]
		detail    = details[component]

		if component is 'parameters'
			detail  = detail.join ', '
			filters = filters.filter (filter, i) -> i > 0

		for filter in filters when filters.length isnt 1
			switch filter
				when 'camelCase', 'lowerCamelCase' then detail = detail.charAt(0).toLowerCase() + detail.slice(1)
				when 'lowerCase' then detail = detail.toLowerCase()
				when 'screamingSnakeCase' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1_$2').toUpperCase()
				when 'snakeCase' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase()
				when 'spinalCase' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()
				when 'trainCase' then detail = detail.replace(/([a-z\d])([A-Z])/g, '$1-$2').charAt(0).toUpperCase() + detail.replace(/([a-z\d])([A-Z])/g, '$1-$2').slice(1)
				when 'upperCamelCase' then detail = detail.charAt(0).toUpperCase() + detail.slice(1)
				when 'upperCase' then detail = detail.toUpperCase()

		compiled.push if detail then detail else component

	output = compiled.join ''