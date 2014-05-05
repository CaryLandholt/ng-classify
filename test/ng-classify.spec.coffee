ngClassify = require '../index'

describe 'ng-classify', ->
	it 'should compile an Animation', ->
		input = '''
		class MyCrazyFader extends Animation
			constructor: ->
				return {
					enter: (element, done) ->
						# run the animation here and call done when the animation is complete

						cancellation = (element) ->
							# this (optional) function will be called when the animation
							# completes or when the animation is cancelled (the cancelled
							# flag will be set to true if cancelled).
						}
		'''

		result = ngClassify input

		expectation = '''
		class MyCrazyFader
			constructor: ->
				return {
					enter: (element, done) ->
						# run the animation here and call done when the animation is complete

						cancellation = (element) ->
							# this (optional) function will be called when the animation
							# completes or when the animation is cancelled (the cancelled
							# flag will be set to true if cancelled).
						}

		angular.module('app').animation '.my-crazy-fader', [MyCrazyFader]
		'''

		expect(result).toEqual(expectation)

	it 'should compile an App', ->
		input = '''
		class App extends App
			@constructor = []
		'''

		result = ngClassify input

		expectation = '''
		class App
			@constructor = []

		angular.module 'app', App.constructor
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Config', ->
		input = '''
		class Routes extends Config
			constructor: ($routeProvider) ->
				$routeProvider
				.when '/home',
					controller: 'homeController'
					templateUrl: 'home.html'
				.when '/about',
					controller: 'aboutController'
					templateUrl: 'about.html'
				.otherwise
					redirectTo: '/home'
		'''

		result = ngClassify input

		expectation = '''
		class Routes
			constructor: ($routeProvider) ->
				$routeProvider
				.when '/home',
					controller: 'homeController'
					templateUrl: 'home.html'
				.when '/about',
					controller: 'aboutController'
					templateUrl: 'about.html'
				.otherwise
					redirectTo: '/home'

		angular.module('app').config ['$routeProvider', Routes]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Constant', ->
		input = '''
		class HttpStatusCodes extends Constant
			@constructor =
				'401': 'Unauthorized'
				'403': 'Forbidden'
				'404': 'Not Found'
		'''

		result = ngClassify input

		expectation = '''
		class HttpStatusCodes
			@constructor =
				'401': 'Unauthorized'
				'403': 'Forbidden'
				'404': 'Not Found'

		angular.module('app').constant 'HTTP_STATUS_CODES', HttpStatusCodes.constructor
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Controller', ->
		input = '''
		class Home extends Controller
			constructor: (userService) ->
				@save = (username) ->
					userService.addUser username
		'''

		result = ngClassify input

		expectation = '''
		class Home
			constructor: (userService) ->
				@save = (username) ->
					userService.addUser username

		angular.module('app').controller 'homeController', ['userService', Home]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Directive', ->
		input = '''
		class Dialog extends Directive
			constructor: ->
				return {
					restrict: 'E'
					transclude: true
					templateUrl: 'dialog.html'
				}
		'''

		result = ngClassify input

		expectation = '''
		class Dialog
			constructor: ->
				return {
					restrict: 'E'
					transclude: true
					templateUrl: 'dialog.html'
				}

		angular.module('app').directive 'dialog', [Dialog]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Factory', ->
		input = '''
		class Collection extends Factory
			constructor: ($log) ->
				return class
					constructor: (collection) ->
						isUndefined = angular.isUndefined collection

						if isUndefined
							collection = []

						isArray = angular.isArray collection

						if not isArray
							throw new Error 'Collection must be an array'

						$log.debug 'creating collection', collection

						originalCollection = angular.copy collection

						@append = (item) ->
							$log.debug "appending \"#{item}\" to", collection
							collection.push item
							@

						@get = ->
							$log.debug 'getting collection', collection
							collection

						@getOriginal = ->
							$log.debug 'getting original collection', originalCollection
							originalCollection

						@prepend = (item) ->
							$log.debug "prepending \"#{item}\" to", collection
							collection.unshift item
							@

						@sort = (direction = 'asc') ->
							$log.debug "sorting by \"#{direction}\"", collection

							directions = ['asc', 'desc']
							isValidDirection = directions.indexOf(direction) isnt -1

							if not isValidDirection
								throw new Error "Direction must be either asc or desc.  \"#{direction}\" passed"

							if direction is 'asc'
								collection.sort()
							else
								collection.reverse()

							@
		'''

		result = ngClassify input

		expectation = '''
		class Collection
			constructor: ($log) ->
				return class
					constructor: (collection) ->
						isUndefined = angular.isUndefined collection

						if isUndefined
							collection = []

						isArray = angular.isArray collection

						if not isArray
							throw new Error 'Collection must be an array'

						$log.debug 'creating collection', collection

						originalCollection = angular.copy collection

						@append = (item) ->
							$log.debug "appending \"#{item}\" to", collection
							collection.push item
							@

						@get = ->
							$log.debug 'getting collection', collection
							collection

						@getOriginal = ->
							$log.debug 'getting original collection', originalCollection
							originalCollection

						@prepend = (item) ->
							$log.debug "prepending \"#{item}\" to", collection
							collection.unshift item
							@

						@sort = (direction = 'asc') ->
							$log.debug "sorting by \"#{direction}\"", collection

							directions = ['asc', 'desc']
							isValidDirection = directions.indexOf(direction) isnt -1

							if not isValidDirection
								throw new Error "Direction must be either asc or desc.  \"#{direction}\" passed"

							if direction is 'asc'
								collection.sort()
							else
								collection.reverse()

							@

		angular.module('app').factory 'Collection', ['$log', Collection]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Filter', ->
		input = '''
		class Twitterfy extends Filter
			constructor: ->
				return (username) ->
					"@#{username}"
		'''

		result = ngClassify input

		expectation = '''
		class Twitterfy
			constructor: ->
				return (username) ->
					"@#{username}"

		angular.module('app').filter 'twitterfy', [Twitterfy]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Provider', ->
		input = '''
		class Greetings extends Provider
			constructor: ($log) ->
				@name = 'default'

				@$get = ->
					name = @name

					sayHello: ->
						$log.info name

				@setName = (name) ->
					@name = name
		'''

		result = ngClassify input

		expectation = '''
		class Greetings
			constructor: ($log) ->
				@name = 'default'

				@$get = ->
					name = @name

					sayHello: ->
						$log.info name

				@setName = (name) ->
					@name = name

		angular.module('app').provider 'greetingsProvider', ['$log', Greetings]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Run', ->
		input = '''
		class ViewsBackend extends Run
			constructor: ($httpBackend) ->
					$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough()
		'''

		result = ngClassify input

		expectation = '''
		class ViewsBackend
			constructor: ($httpBackend) ->
					$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough()

		angular.module('app').run ['$httpBackend', ViewsBackend]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Service', ->
		input = '''
		class Greeting extends Service
			constructor: ($log) ->
				@sayHello = (name) ->
					$log.info name
		'''

		result = ngClassify input

		expectation = '''
		class Greeting
			constructor: ($log) ->
				@sayHello = (name) ->
					$log.info name

		angular.module('app').service 'greetingService', ['$log', Greeting]
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Value', ->
		input = '''
		class People extends Value
			@constructor = [
				{
					name: 'Luke Skywalker'
					age: 26
				}
				{
					name: 'Han Solo'
					age: 35
				}
			]
		'''

		result = ngClassify input

		expectation = '''
		class People
			@constructor = [
				{
					name: 'Luke Skywalker'
					age: 26
				}
				{
					name: 'Han Solo'
					age: 35
				}
			]

		angular.module('app').value 'people', People.constructor
		'''

		expect(result).toEqual(expectation)

	it 'should compile a Controller with @ in the constructor', ->
		input = '''
		class Home extends Controller
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username
		'''

		result = ngClassify input

		expectation = '''
		class Home
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username

		angular.module('app').controller 'homeController', ['userService', Home]
		'''

		notExpectation = '''
		class Home
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username

		angular.module('app').controller 'homeController', ['@userService', Home]
		'''

		expect(result).toEqual(expectation)
		expect(result).not.toEqual(notExpectation)

	it 'should compile multiple Controllers', ->
		input = '''
		class Home extends Controller
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username

		class AnotherHome extends Controller
			constructor: (anotherService) ->
				@save = (username) ->
					userService.addUser username
		'''

		result = ngClassify input

		expectation = '''
		class Home
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username

		class AnotherHome
			constructor: (anotherService) ->
				@save = (username) ->
					userService.addUser username

		angular.module('app').controller 'homeController', ['userService', Home]
		angular.module('app').controller 'anotherHomeController', ['anotherService', AnotherHome]
		'''

		expect(result).toEqual(expectation)

	it 'should compile with block comments before the class', ->
		input = '''
		###
		My Home Controller
		###
		class Home extends Controller
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username
		'''

		result = ngClassify input

		expectation = '''
		###
		My Home Controller
		###
		class Home
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username

		angular.module('app').controller 'homeController', ['userService', Home]
		'''

		expect(result).toEqual(expectation)

	it 'should compile with block comments before the constructor', ->
		input = '''
		class Home extends Controller
			###
			The Constructor
			###
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username
		'''

		result = ngClassify input

		expectation = '''
		class Home
			###
			The Constructor
			###
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username

		angular.module('app').controller 'homeController', ['userService', Home]
		'''

		expect(result).toEqual(expectation)

	it 'should compile with inline comments before the constructor', ->
		input = '''
		class Home extends Controller
			# The Constructor
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username
		'''

		result = ngClassify input

		expectation = '''
		class Home
			# The Constructor
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username

		angular.module('app').controller 'homeController', ['userService', Home]
		'''

		expect(result).toEqual(expectation)

	it 'should compile multiple Controllers with comments and functions', ->
		input = '''
		###
		My Home Controller
		###
		cube = (x) ->
			x * x * x

		class Home extends Controller
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username + cube(3)

		###
		My AnotherHome Controller
		###
		class AnotherHome extends Controller
			square = (x) ->
				x * x

			# the constructor
			constructor: (anotherService) ->
				@save = (username) ->
					userService.addUser username + square(2)
		'''

		result = ngClassify input

		expectation = '''
		###
		My Home Controller
		###
		cube = (x) ->
			x * x * x

		class Home
			constructor: (@userService) ->
				@save = (username) ->
					userService.addUser username + cube(3)

		###
		My AnotherHome Controller
		###
		class AnotherHome
			square = (x) ->
				x * x

			# the constructor
			constructor: (anotherService) ->
				@save = (username) ->
					userService.addUser username + square(2)

		angular.module('app').controller 'homeController', ['userService', Home]
		angular.module('app').controller 'anotherHomeController', ['anotherService', AnotherHome]
		'''

		expect(result).toEqual(expectation)

	it 'should leave standard classes as-is', ->
		input = '''
		class Animal
			constructor: (@name) ->

			move: (meters) ->
				alert @name + " moved #{meters}m."
		'''

		result = ngClassify input

		expect(result).toEqual(input)

	it 'should leave non angular classes as-is', ->
		input = '''
		class Snake extends Animal
			constructor: (@name) ->

			move: ->
				super 5
		'''

		result = ngClassify input

		expect(result).toEqual(input)

	it 'should compile nested classes', ->
		input = '''
		class A extends Controller
			constructor: (aa, ab) ->
				return class AA extends Service
					constructor: (aaa) ->
						console.log 'perms'

		class B extends Directive
			constructor: (ba) ->
				return class BA extends Factory
					constructor: (baa, bab) ->
						return class BAA extends Provider
							constructor: (baaa) ->
		'''

		result = ngClassify input

	it 'should compile with a moduleType prefix', ->
		input = '''
		class Home extends Ng.Controller
			constructor: ($log) ->
				$log.info 'controller with prefix'
		'''

		result = ngClassify input, prefix: 'Ng'

		expectation = '''
		class Home
			constructor: ($log) ->
				$log.info 'controller with prefix'

		angular.module('app').controller 'homeController', ['$log', Home]
		'''

		expect(result).toEqual(expectation)

	it 'should compile with a namespace with an ending period (.)', ->
		input = '''
		class Home extends Ng.My.Controller
			constructor: ($log) ->
				$log.info 'controller with prefix'
		'''

		result = ngClassify input, prefix: 'Ng.My.'

		expectation = '''
		class Home
			constructor: ($log) ->
				$log.info 'controller with prefix'

		angular.module('app').controller 'homeController', ['$log', Home]
		'''

		expect(result).toEqual(expectation)