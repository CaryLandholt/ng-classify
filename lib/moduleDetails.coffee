applyCaseFilters = require './applyCaseFilters'

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

		if filters.length > 1
			filters = filters.slice(1)
			detail  = applyCaseFilters detail, filters

		compiled.push if detail then detail else component

	output = compiled.join ''