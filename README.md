# ng-classify [![Build Status](https://secure.travis-ci.org/CaryLandholt/ng-classify.png)](http://travis-ci.org/CaryLandholt/ng-classify)

> Convert CoffeeScript classes to [AngularJS](http://angularjs.org/) modules

[![NPM version](https://badge.fury.io/js/ng-classify.png)](http://badge.fury.io/js/ng-classify)
[![dependency status](https://david-dm.org/CaryLandholt/ng-classify.png)](https://david-dm.org/CaryLandholt/ng-classify)

## Table of Contents

* [Overview](#overview)
	- [Why?](#why)
	- [How?](#how)
	- [CoffeeScript classes](#coffeescript-classes)
	- [Benefits](#benefits)
	- [Considerations](#considerations)
	- [Limitations](#limitations)
	- [Controller As Syntax](#controller-as-syntax)
* [Naming Conventions](#naming-conventions)
* [Module Types](#module-types)
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
	- [Value](#Value)
* [Install](#install)
* [Examples](#examples)
	- [CoffeeScript](#coffeescript)
	- [JavaScript](#javascript)
* [API](#api)

## Overview

[AngularJS](http://angularjs.org/) is well suited to take advantage of the [CoffeeScript class](http://coffeescript.org/#classes) syntax.
However there's still a bit of boilerplate code we have to work through.
ng-classify makes it easy.

Here's how you write a controller using ng-classify

```coffee
class My extends Controller
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()
```

which is equivalent to

```javascript
angular.module('app').controller('myController', ['$scope', 'someService', function ($scope, someService) {
	$scope.coolMethod = someService.coolMethod();
}]);
```

### Why?

Take the following typical AngularJS controller declaration

```javascript
angular.module('app').controller('myController', ['$scope', 'someService', function ($scope, someService) {
	$scope.coolMethod = someService.coolMethod();
}]);
```

So what's wrong with this?

* App name, `angular.module('app').controller`, is required within the declaration
	- some avoid this by the use of a global variable, `app.controller`, which is not good JavaScript hygiene
* Parameter names are duplicated, one for the getters, `'$scope', 'someService'`, and one for the function parameters, `function ($scope, someService)`
	- this duplication is required to make the module minifiable
	- some avoid this by the use of [ngmin](https://github.com/btford/ngmin)
* Depending upon employed naming convention, modyle type, `controller`, and module name, `myController`, have duplication
* The function is anonymous (unnamed), making it more difficult to debug
* Generally verbose

### How?

Write AngularJS modules using the following syntax.
NOTE: `{{placeholder}}` denotes placeholders

```coffee
class {{appName}} extends {{Animation|Config|Controller|Directive|Factory|Filter|Provider|Run|Service}}
	constructor: ({{params}}) ->
		# module body here
```

or

```coffee
class {{name}} extends {{Constant|Value}}
	@constructor = {{value}}
```

### CoffeeScript Classes

The typical way to use CoffeeScript classes with AngularJS is as follows.

```coffee
class MyController
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()

angular.module('app').controller 'myController', ['$scope', 'someService', MyController]
```

which is equivalent to

```javascript
angular.module('app').controller('myController', ['$scope', 'someService', function MyController($scope, someService) {
	$scope.coolMethod = someService.coolMethod();
}]);
```

with ng-classify, this is all you need

```coffee
class My extends Controller
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

### Limitations

* One class per file
* The first line in the class must be the constructor

### Controller As Syntax

AngularJS provides two styles for writing and consuming controller
1. `$scope`
2. `this` with `Controller as`

`$scope` example

```coffee
class My extends Controller
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()
```

view for `$scope` example

```html
<div ng-controller="myController">
	<button ng-click="coolMethod()">Cool It Down!</button>
</div>
```

`this` example

```coffee
class My extends Controller
	constructor: (someService) ->
		@coolMethod = someService.coolMethod()
```

view for `this` example

```html
<div ng-controller="myController as controller">
	<button ng-click="controller.coolMethod()">Cool It Down!</button>
</div>
```

**The examples below use the `this` syntax**

## Naming Conventions

The following naming conventions are used.
NOTE: *ClassName* is used as the example class name

Module Type | Rendered Module Name
--- | ---
Animation | .class-name
Config | *n/a*
Constant | CLASS_NAME
Controller | classNameController
Directive | className
Factory | ClassName
Filter | className
Provider | classNameProvider
Run | *n/a*
Service | classNameService
Value | className

## Module Types

### Animation

```coffee
class MyCrazyAnimation extends Animation
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
angular.module('app').animation('.my-crazy-animation', [
	function MyCrazyAnimation() {
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
Notice the `return class` statement inside the first constructor function.  This provides the ability to create a new instance of the class.

```coffee
class Collection extends Factory
	constructor: ($log) ->
		return class CollectionInstance
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
			function CollectionInstance(collection) {
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
			return "@" + username;
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
class Greetings extends Service
	constructor: ($log) ->
		@sayHello = (name) ->
			$log.info name
```

equivalent to

```javascript
angular.module('app').service('greetingsService', ['$log',
	function Greetings($log) {
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

## Install

Install with [npm](https://npmjs.org/package/ng-classify)

```shell
npm install --save-dev ng-classify
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

### ngClassify(coffeeScriptClass, options)

#### coffeeScriptClass

Type: `String`
Default: `undefined`

The contents of a CoffeeScript class to be converted into an AngularJS module

#### options

Type: `Object`

##### options.appName

Type: `String`
Default: `'app'`

The name of the AngularJS app