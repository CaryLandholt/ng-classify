caseChangeRegEx = /([a-z\d])([A-Z])/g

module.exports = (input, caseFormat) ->
	return if caseFormat in ['camelCase', 'lowerCamelCase']
		input[0].toLowerCase() + input[1..]

	return if caseFormat is 'lowerCase'
		input.toLowerCase()

	return if caseFormat is 'screamingSnakeCase'
		input.replace(/-/g, '_').replace(caseChangeRegEx, '$1_$2').toUpperCase()

	return if caseFormat is 'snakeCase'
		input.replace(/-/g, '_').replace(caseChangeRegEx, '$1_$2').toLowerCase()

	return if caseFormat is 'spinalCase'
		input.replace(/_/g, '-').replace(caseChangeRegEx, '$1-$2').toLowerCase()

	return if caseFormat is 'trainCase'
		input = input.replace(/_/g, '-')

		input.replace(caseChangeRegEx, '$1-$2')[0].toUpperCase() + input.replace(caseChangeRegEx, '$1-$2')[1..]

	return if caseFormat is 'upperCamelCase'
		input[0].toUpperCase() + input[1..]

	return if caseFormat is 'upperCase'
		input.toUpperCase()

	throw new Error "invalid caseFormat '#{caseFormat}'"