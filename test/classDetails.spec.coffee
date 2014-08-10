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
			appName: null
			parameters: [
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 28
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
			appName: null
			parameters: [
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 28
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
			appName: null
			parameters: [
				"'$log'"
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 28
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
			appName: null
			parameters: [
				"'$log'"
				"'$httpBackend'"
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 28
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
			appName: null
			parameters: [
				"'$log'"
				"'$httpBackend'"
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 28
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
			appName: null
			parameters: [
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 31
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
			appName: null
			parameters: [
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 34
		]

		expect(result).toEqual(expectation)

	it 'should collect class details with and without an ending period (.) in the prefix', ->
		input = '''
		class Home extends Ng.My.Controller
			console.log 'no constructor'
		'''
	
		result = classDetails input, moduleTypes('Ng.My.')
	
		expectation = [
			className: 'Home'
			moduleType: 'Ng.My.Controller'
			appName: null
			parameters: [
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 34
		]

		expect(result).toEqual(expectation)
		expect(result[0].moduleType).toEqual('Ng.My.Controller')

		result = classDetails input, moduleTypes('Ng.My')

		expect(result[0].moduleType).toEqual('Ng.My.Controller')
		expect(result[0].moduleType).not.toEqual('Ng.My..Controller')
		expect(result[0].moduleType).not.toEqual('Ng.MyController')

	it 'should collect class details with a do in the constructor', ->
		input = '''
		class Home extends Controller
			constructor: do ->
		'''

		result = classDetails input, moduleTypes('')

		expectation = [
			className: 'Home'
			moduleType: 'Controller'
			appName: null
			parameters: [
				'Home'
			]
			position:
				row: 0
				start: 9
				end: 28
		]

		expect(result).toEqual(expectation)

	describe 'appName class definition', ->
		it 'should collect class details with appName', ->
			input = '''
			class Home extends Controller('common')
				console.log 'no constructor'
			'''

			result = classDetails input, moduleTypes('')

			expectation = [
				className: 'Home'
				moduleType: 'Controller'
				appName: 'common'
				parameters: [
					'Home'
				]
				position:
					row: 0
					start: 9
					end: 38
			]

			expect(result).toEqual(expectation)