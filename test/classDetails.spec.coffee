classDetails = require '../lib/classDetails'
moduleTypes  = require '../lib/moduleTypes'

describe 'classDetails', ->
	it 'should collect class details with no constructor', ->
		input = '''
		class Home extends Controller
			console.log 'no constructor'
		'''

		result = classDetails input, moduleTypes('')

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

		result = classDetails input, moduleTypes('')

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

		result = classDetails input, moduleTypes('')

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

		result = classDetails input, moduleTypes('')

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

		result = classDetails input, moduleTypes('')

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

	it 'should collect class details with a single prefix (namespace)', ->
		input = '''
		class Home extends Ng.Controller
			console.log 'no constructor'
		'''

		result = classDetails input, moduleTypes('Ng.')

		expectation = [
			className: 'Home'
			moduleType: 'Ng.Controller'
			parameters: [
				'Home'
			]
		]

		expect(result).toEqual(expectation)

	it 'should collect class details with a multiple namespaces', ->
		input = '''
		class Home extends Ng.My.Controller
			console.log 'no constructor'
		'''

		result = classDetails input, moduleTypes('Ng.My.')

		expectation = [
			className: 'Home'
			moduleType: 'Ng.My.Controller'
			parameters: [
				'Home'
			]
		]

		expect(result).toEqual(expectation)

	it 'should collect class details with a and without an ending period (.) in the prefix', ->
		input = '''
		class Home extends Ng.My.Controller
			console.log 'no constructor'
		'''

		result = classDetails input, moduleTypes('Ng.My.')

		expectation = [
			className: 'Home'
			moduleType: 'Ng.My.Controller'
			parameters: [
				'Home'
			]
		]

		expect(result).toEqual(expectation)
		expect(result[0].moduleType).toEqual('Ng.My.Controller')

		result = classDetails input, moduleTypes('Ng.My')

		expect(result[0].moduleType).toEqual('Ng.My.Controller')
		expect(result[0].moduleType).not.toEqual('Ng.My..Controller')
		expect(result[0].moduleType).not.toEqual('Ng.MyController')