applyCaseFilters = require '../lib/applyCaseFilters'

describe 'applyCaseFilters', ->
	it 'should filter by lowerCase', ->
		input       = 'myInput'
		filters     = ['lowerCase']
		result      = applyCaseFilters input, filters
		expectation = 'myinput'

		expect(result).toEqual(expectation)

	it 'should filter by screamingSnakeCase and lowerCase', ->
		input       = 'myInput'
		filters     = ['screamingSnakeCase', 'lowerCase']
		result      = applyCaseFilters input, filters
		expectation = 'my_input'

		snakeCased  = applyCaseFilters input, ['snakeCase']

		expect(result).toEqual(expectation)
		expect(snakeCased).toEqual(expectation)

	it 'should filter by trainCase and screamingSnakeCase', ->
		input       = 'thisIsMyInput'
		filters     = ['trainCase', 'screamingSnakeCase']
		result      = applyCaseFilters input, filters
		expectation = 'THIS_IS_MY_INPUT'

		expect(result).toEqual(expectation)

	it 'should filter by snakeCase and screamingSnakeCase', ->
		input       = 'thisIsMyInput'
		filters     = ['snakeCase', 'screamingSnakeCase']
		result      = applyCaseFilters input, filters
		expectation = 'THIS_IS_MY_INPUT'

		expect(result).toEqual(expectation)