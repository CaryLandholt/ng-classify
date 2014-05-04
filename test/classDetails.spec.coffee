classDetails = require '../lib/classDetails'

describe 'classDetails', ->
	it 'should collect class details with no constructor', ->
		input = '''
		class Home extends Controller
			console.log 'no constructor'
		'''

		result = classDetails input

		expectation = [
			className: 'Home'
			moduleType: 'Controller'
			parameters: [
				'Home'
			]
		]

		expect(result).toEqual(expectation)

	it 'should collect class details with no constructor parameters', ->
		input = '''
		class Home extends Controller
			constructor: ->
				console.log 'no parameters'
		'''

		result = classDetails input

		expectation = [
			className: 'Home'
			moduleType: 'Controller'
			parameters: [
				'Home'
			]
		]

		expect(result).toEqual(expectation)

	it 'should collect class details with one constructor parameter', ->
		input = '''
		class Home extends Controller
			constructor: ($log) ->
				$log.info 'one parameter'
		'''

		result = classDetails input

		expectation = [
			className: 'Home'
			moduleType: 'Controller'
			parameters: [
				"'$log'"
				'Home'
			]
		]

		expect(result).toEqual(expectation)

	it 'should collect class details with multiple constructor parameters', ->
		input = '''
		class Home extends Controller
			constructor: ($log, $httpBackend) ->
				$log.info 'multiple parameters'
		'''

		result = classDetails input

		expectation = [
			className: 'Home'
			moduleType: 'Controller'
			parameters: [
				"'$log'"
				"'$httpBackend'"
				'Home'
			]
		]

		expect(result).toEqual(expectation)

	it 'should collect class details with multiple constructor parameters, one using @ (this)', ->
		input = '''
		class Home extends Controller
			constructor: (@$log, $httpBackend) ->
				@$log.info 'multiple parameters'
		'''

		result = classDetails input

		expectation = [
			className: 'Home'
			moduleType: 'Controller'
			parameters: [
				"'$log'"
				"'$httpBackend'"
				'Home'
			]
		]

		expect(result).toEqual(expectation)