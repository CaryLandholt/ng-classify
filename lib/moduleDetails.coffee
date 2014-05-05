applyCaseFilters = require './applyCaseFilters'

module.exports = (details, options) ->
	prefixLessModuleType = details.moduleType.split('.')[-1..][0]
	format               = options.formats[prefixLessModuleType.toLowerCase()]
	parts                = format.split /{{(.*?)}}/
	compiled             = []

	parts.forEach (part) ->
		filters   = part.split '|'
		component = filters[0]
		detail    = details[component]

		if component is 'parameters'
			detail  = detail.join ', '
			filters = filters.filter (filter, i) -> i > 0

		if filters.length > 1
			filters = filters.slice(1)
			key     = if component is 'moduleType' then prefixLessModuleType else detail
			detail  = applyCaseFilters key, filters

		compiled.push if detail then detail else component

	output = compiled.join ''