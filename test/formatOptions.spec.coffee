formatOptions = require '../lib/formatOptions'

describe 'formatOptions', ->
	it 'should get default options', ->
		options = undefined
		result = formatOptions(options).animation

		expectation =
			format: 'spinalCase'
			prefix: '.'
			suffix: ''

		expect(result).toEqual(expectation)

	it 'should override default format', ->
		options = animation:
			format: 'screamingSnakeCase'

		result = formatOptions(options).animation

		expectation =
			format: 'screamingSnakeCase'
			prefix: '.'
			suffix: ''

		expect(result).toEqual(expectation)

	it 'should override empty suffix', ->
		options = constant:
			suffix: '_CONSTANT'

		result = formatOptions(options).constant

		expectation =
			format: 'screamingSnakeCase'
			prefix: ''
			suffix: '_CONSTANT'

		expect(result).toEqual(expectation)