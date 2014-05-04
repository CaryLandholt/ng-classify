changeCase = require '../lib/changeCase'

describe 'formatOptions', ->
	it 'should change to camelCase', ->
		format      = 'camelCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'myInput'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to lowerCamelCase', ->
		format      = 'lowerCamelCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'myInput'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to lowerCase', ->
		format      = 'lowerCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'myinput'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to screamingSnakeCase', ->
		format      = 'screamingSnakeCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'MY_INPUT'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to snakeCase', ->
		format      = 'snakeCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'my_input'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to spinalCase', ->
		format      = 'spinalCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'my-input'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to trainCase', ->
		format      = 'trainCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'My-Input'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to upperCamelCase', ->
		format      = 'upperCamelCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'MyInput'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should change to upperCase', ->
		format      = 'upperCase'
		input       = 'myInput'
		result      = changeCase input, format
		expectation = 'MYINPUT'

		expect(result).toEqual(expectation)

		input       = 'MyInput'
		result      = changeCase input, format

		expect(result).toEqual(expectation)

	it 'should catch invalid caseFormat exception', ->
		format      = 'zebraCase'
		input       = 'myInput'
		result      = -> changeCase input, format
		expectation = new Error "invalid caseFormat 'zebraCase'"

		expect(result).toThrow(expectation)