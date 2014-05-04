# ng-classify [![Version][version-image]][version-url] [![Build Status][build-image]][build-url] [![Dependency Status][dependencies-image]][dependencies-url] [![License][license-image]][license-url]
> Convert CoffeeScript classes to [AngularJS](http://angularjs.org/) modules


## Table of Contents
* [Overview](#overview)
	- [Why?](#why)
	- [How?](#how)
	- [CoffeeScript classes](#coffeescript-classes)
	- [Benefits](#benefits)
	- [Considerations](#considerations)
	- [Controller As Syntax](#controller-as-syntax)
* [Module Types](#module-types)
	- [App](#app)
	- [Animation](#animation)
	- [Config](#config)
	- [Constant](#constant)
	- [Controller](#controller)
	- [Directive](#directive)
	- [Factory](#factory)
	- [Filter](#filter)
	- [Provider](#provider)
	- [Run](#run)
	- [Service](#service)
	- [Value](#value)
* [Installing](#installing)
* [Examples](#examples)
	- [CoffeeScript](#coffeescript)
	- [JavaScript](#javascript)
* [API](#api)
* [Contributing](#contributing)
* [Changelog](#changelog)
* [License](#license)


## Overview
[AngularJS](http://angularjs.org/) is well suited to take advantage of the [CoffeeScript class](http://coffeescript.org/#classes) syntax.
However there's still a bit of boilerplate code we have to work through.
ng-classify makes it easy.

Here's how you write a controller using ng-classify
```coffee
class Admin extends Controller
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()
```

which is equivalent to
```javascript
angular.module('app').controller('adminController', ['$scope', 'someService', function ($scope, someService) {
	$scope.coolMethod = someService.coolMethod();
}]);
```


### Why?
Take the following typical AngularJS controller declaration *(same as above)*
```javascript
angular.module('app').controller('adminController', ['$scope', 'someService', function ($scope, someService) {
	$scope.coolMethod = someService.coolMethod();
}]);
```

So what's wrong with this?
* App name, `angular.module('app').controller`, is required within the declaration
	- some avoid this by the use of a global variable, `app.controller`, which is not good JavaScript hygiene
* Parameter names are duplicated, one for the getters, `'$scope', 'someService'`, and one for the function parameters, `function ($scope, someService)`
	- this duplication is required to make the module minifiable
	- some avoid this by the use of [ngmin](https://github.com/btford/ngmin)
* Depending upon the employed naming format, module type, `controller`, and module name, `adminController`, have duplication, due to the suffixed `controller` in this example
* The function is anonymous (unnamed), making it more difficult to debug
* Generally verbose


### How?
Write AngularJS modules using the following syntaxes.
NOTE: `{{placeholder}}` denotes placeholders
```coffee
class {{appName}} extends {{App|Animation|Config|Controller|Directive|Factory|Filter|Provider|Run|Service}}
	constructor: ({{params}}) ->
		# module body here
```

or
```coffee
class {{name}} extends {{App|Constant|Value}}
	@constructor = {{value}}
```


### CoffeeScript Classes
The typical way to use CoffeeScript classes with AngularJS is as follows.
```coffee
class AdminController
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()

angular.module('app').controller 'adminController', ['$scope', 'someService', AdminController]
```

which is equivalent to
```javascript
angular.module('app').controller('adminController', ['$scope', 'someService', function AdminController($scope, someService) {
	$scope.coolMethod = someService.coolMethod();
}]);
```

with ng-classify, this is all you need
```coffee
class Admin extends Controller
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()
```


### Benefits
* App name is not required when writing a module
	- it is now configurable
* Parameters are included once via the `constructor` function
* No need to suffix the module name with the module type, e.g. my*Controller*
* The function is named, making debugging more convenient
* The syntax is arguably concise


### Considerations
* To avoid the use of global variables, it is advised to use the `bare: false` CoffeeScript compilation option.  see [CoffeeScript Usage](http://coffeescript.org/#usage)


### Controller As Syntax
AngularJS provides two styles for writing and consuming controllers

1. `$scope`
2. `this` with `Controller as`

`$scope` example
```coffee
class Admin extends Controller
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()
```

view for `$scope` example
```html
<div ng-controller="adminController">
	<button ng-click="coolMethod()">Cool It Down!</button>
</div>
```

`this` example
```coffee
class Admin extends Controller
	constructor: (someService) ->
		@coolMethod = someService.coolMethod()
```

view for `this` example
```html
<div ng-controller="adminController as controller">
	<button ng-click="controller.coolMethod()">Cool It Down!</button>
</div>
```


## Module Types


### App
*Although there is no AngularJS App module type, it is included for consistency.*
```coffee
class App extends App
	@constructor = [
		'ngAnimate'
		'ngRoute'
	]
```

equivalent to
```javascript
angular.module('app', [
	'ngAnimate',
	'ngRoute'
]);
```


### Animation
```coffee
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
```

equivalent to
```javascript
angular.module('app').animation('.my-crazy-fader', [
	function MyCrazyFader() {
		return {
			enter: function (element, done) {
				// run the animation here and call done when the animation is complete

				var cancellation = function (element) {
					// this (optional) function will be called when the animation
					// completes or when the animation is cancelled (the cancelled
					// flag will be set to true if cancelled).
				};

				return cancellation;
			}
		};
	}
]);
```


### Config
```coffee
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
```

equivalent to
```javascript
angular.module('app').config(['$routeProvider',
	function Routes($routeProvider) {
		$routeProvider
		.when('/home', {
			controller: 'homeController',
			templateUrl: 'home.html'
		})
		.when('/about', {
			controller: 'aboutController',
			templateUrl: 'about.html'
		})
		.otherwise({
			redirectTo: '/home'
		});
	}
]);
```


### Constant
```coffee
class HttpStatusCodes extends Constant
	@constructor =
		'401': 'Unauthorized'
		'403': 'Forbidden'
		'404': 'Not Found'
```

equivalent to
```javascript
angular.module('app').constant('HTTP_STATUS_CODES', {
	'401': 'Unauthorized',
	'403': 'Forbidden',
	'404': 'Not Found'
});
```


### Controller
*The example below uses the [this](#controller-as-syntax) syntax*
```coffee
class Home extends Controller
	constructor: (userService) ->
		@save = (username) ->
			userService.addUser username
```

equivalent to
```javascript
angular.module('app').controller('homeController', ['userService',
	function Home(userService) {
		this.save = function (username) {
			return userService.addUser(username);
		};
	}
]);
```


### Directive
```coffee
class Dialog extends Directive
	constructor: ->
		return {
			restrict: 'E'
			transclude: true
			templateUrl: 'dialog.html'
		}
```

equivalent to
```javascript
angular.module('app').directive('dialog', [
	function Dialog() {
		return {
			restrict: 'E',
			transclude: true,
			templateUrl: 'dialog.html'
		};
	}
]);
```


### Factory
Although the following is a large example, it illustrates the use of the `new` keyword with Factories.
Notice the `return class` statement inside the first constructor function.  This provides the ability to create a new instance of the class.  *Note: this is not required*
```coffee
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
```

equivalent to
```javascript
angular.module('app').factory('Collection', ['$log',
	function Collection($log) {
		return (function () {
			function _Class(collection) {
				var isUndefined = angular.isUndefined(collection);

				if (isUndefined) {
					collection = [];
				}

				var isArray = angular.isArray(collection);

				if (!isArray) {
					throw new Error('Collection must be an array');
				}

				$log.debug('creating collection', collection);

				var originalCollection = angular.copy(collection);

				this.append = function (item) {
					$log.debug("appending \"" + item + "\" to", collection);
					collection.push(item);

					return this;
				};

				this.get = function () {
					$log.debug('getting collection', collection);

					return collection;
				};

				this.getOriginal = function () {
					$log.debug('getting original collection', originalCollection);

					return originalCollection;
				};

				this.prepend = function (item) {
					$log.debug("prepending \"" + item + "\" to", collection);
					collection.unshift(item);

					return this;
				};

				this.sort = function (direction) {
					if (direction == null) {
						direction = 'asc';
					}

					$log.debug("sorting by \"" + direction + "\"", collection);

					var directions = ['asc', 'desc'];

					var isValidDirection = directions.indexOf(direction) !== -1;

					if (!isValidDirection) {
						throw new Error("Direction must be either asc or desc.  \"" + direction + "\" passed");
					}

					if (direction === 'asc') {
						collection.sort();
					} else {
						collection.reverse();
					}

					return this;
				};
			}

			return CollectionInstance;
		})();
	}
]);
```

usage
```coffee
collection = new Collection()
	.append 'Luke Skywalker'
	.append 'Han Solo'
	.append 'Chewbacca'
	.append 'Yoda'
	.append 'R2D2'
	.sort()
	.get()
```


### Filter
```coffee
class Twitterfy extends Filter
	constructor: ->
		return (username) ->
			"@#{username}"
```

equivalent to
```javascript
angular.module('app').filter('twitterfy', [
	function Twitterfy() {
		return function (username) {
			return '@' + username;
		};
	}
]);
```


### Provider
```coffee
class Greetings extends Provider
	constructor: ($log) ->
		@name = 'default'

		@$get = ->
			name = @name

			sayHello: ->
				$log.info name

		@setName = (name) ->
			@name = name
```

equivalent to
```javascript
angular.module('app').provider('greetingsProvider', ['$log',
	function Greetings($log) {
		this.name = 'default';

		this.$get = function () {
			var name = this.name;

			return {
				sayHello: function () {
					return $log.info(name);
				}
			};
		};

		this.setName = function (name) {
			return this.name = name;
		};
	}
]);
```


### Run
```coffee
class ViewsBackend extends Run
	constructor: ($httpBackend) ->
		$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough()
```

equivalent to
```javascript
angular.module('app').run(['$httpBackend',
	function ViewsBackend($httpBackend) {
		$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough();
	}
]);
```


### Service
```coffee
class Greeting extends Service
	constructor: ($log) ->
		@sayHello = (name) ->
			$log.info name
```

equivalent to

```javascript
angular.module('app').service('greetingService', ['$log',
	function Greeting($log) {
		this.sayHello = function (name) {
			return $log.info(name);
		};
	}
]);
```


### Value
```coffee
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
```

equivalent to

```javascript
angular.module('app').value('people',
	[
		{
			name: 'Luke Skywalker',
			age: 26
		}, {
			name: 'Han Solo',
			age: 35
		}
	]
);
```


## Installing
Install with [npm](https://npmjs.org/package/ng-classify)

```bash
$ npm install --save-dev ng-classify
```


## Examples


### CoffeeScript
```coffee
ngClassify = require 'ng-classify'
coffeeScriptClass = '{{CoffeeScript Class as a String}}'
angularModule = ngClassify coffeeScriptClass
```

### JavaScript
```javascript
var ngClassify = require('ng-classify');
var coffeeScriptClass = '{{CoffeeScript Class as a String}}';
var angularModule = ngClassify(coffeeScriptClass);
```

## API


### ngClassify(content, options)


#### content
Type: `String`
Default: `undefined`

The content that may contain CoffeeScript classes to convert to AngularJS modules


#### options
Type: `Object`


##### options.appName
Type: `String`
Default: `'app'`

The name of the AngularJS app


##### options.prefix
Type: `String`
Default: `''`

To avoid potential collisions, the moduleType prefix may be set (ex: `options.prefix = 'Ng'`)
```coffee
class Home extends Ng.Controller
	@constructor: ($log) ->
		$log.info 'homeController instantiated'
```


##### options.data
Type: `Object`
Default `undefined`

An object used for compiling [Lo-Dash templates](http://lodash.com/docs#template).
If the CoffeeScript file contains Lo-Dash template methods, they will be compiled prior to ng-classify with this object.

The following shows an example of conditionally including the AngularJS module, ngMockE2E, if the environment is `'dev'`.
It will not be included if environment is anything other than `'dev'`.

```coffee
class App extends App
	@constructor = [
		'ngAnimate'
		<% if (environment === 'dev') { %>'ngMockE2E'<% } %>
		'ngRoute'
	]
```

The above class would be compiled using the command below.
```coffee
ngClassify = require 'ng-classify'
coffeeScriptClass = '{{CoffeeScript Class as a String}}'

options =
	data:
		environment: 'dev'

angularModule = ngClassify coffeeScriptClass, options
```


##### options.animation
Type: `Object`
Default: `{format: 'spinalCase', prefix: '.'}`


##### options.constant
Type: `Object`
Default: `{format: 'screamingSnakeCase'}`


##### options.controller
Type: `Object`
Default: `{format: 'camelCase', suffix: 'Controller'}`


##### options.directive
Type: `Object`
Default: `{format: 'camelCase'}`


##### options.factory
Type: `Object`
Default: `{format: 'upperCamelCase'}`


##### options.filter
Type: `Object`
Default: `{format: 'camelCase'}`


##### options.provider
Type: `Object`
Default: `{format: 'camelCase', suffix: 'Provider'}`


##### options.service
Type: `Object`
Default: `{format: 'camelCase', suffix: 'Service'}`


##### options.value
Type: `Object`
Default: `{format: 'camelCase'}`


### Supported Formats
Format | Example
--- | ---
camelCase | camelCase
lowerCamelCase | lowerCamelCase
lowerCase | lowercase
screamingSnakeCase | SCREAMING_SNAKE_CASE
snakeCase | snake_case
spinalCase | spinal-case
trainCase | Train-Case
upperCamelCase | UpperCamelCase
upperCase | UPPERCASE


## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)


## Changelog
See [CHANGELOG.md](CHANGELOG.md)


## License
See [LICENSE](LICENSE)


[build-image]:            http://img.shields.io/travis/CaryLandholt/ng-classify.svg?style=flat
[build-url]:              http://travis-ci.org/CaryLandholt/ng-classify

[dependencies-image]:     http://img.shields.io/gemnasium/CaryLandholt/ng-classify.svg?style=flat
[dependencies-url]:       https://gemnasium.com/CaryLandholt/ng-classify

[license-image]:          http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]:            LICENSE

[version-image]:          http://img.shields.io/npm/v/ng-classify.svg?style=flat
[version-url]:            https://npmjs.org/package/ng-classify