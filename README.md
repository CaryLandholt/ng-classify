# ng-classify [![Build Status](https://secure.travis-ci.org/CaryLandholt/ng-classify.png)](http://travis-ci.org/CaryLandholt/ng-classify)

> Convert CoffeeScript classes to [AngularJS](http://angularjs.org/) modules

[![NPM version](https://badge.fury.io/js/ng-classify.png)](http://badge.fury.io/js/ng-classify)
[![dependency status](https://david-dm.org/CaryLandholt/ng-classify.png)](https://david-dm.org/CaryLandholt/ng-classify)

## Table of Contents

* [Overview](#overview)
* [Module Types](#moduletypes)
	- [Animation](#animation)
	- [Config](#config)
	- [Constant](#constant)
	- [Controller](#controller)
	- [Directive](#directive)
	- [Factory](#factory)
	- [Filter](#filter)
	- [Provider](#provider)
	- [Run](#run)
	- [Value](#Value)
* [Install](#install)
* [Examples](#examples)
* [API](#api)

## Overview

[AngularJS](http://angularjs.org/) is well suited to take advantage of the terse [CoffeeScript class](http://coffeescript.org/#classes) syntax.
However there's still a bit of boilerplate code we have to work through.
ng-classify makes it easy.

Take the following AngularJS module written in JavaScript.

```javascript
angular.module({appName}).controller('coolController', ['coolService', function (coolService) {
	this.coolDown = function (whatToCool) {
		coolService.coolItDown(whatToCool);
	};
}]);
```

Now let's convert it to CoffeeScript

```coffee
angular.module({appName}).controller 'coolController', ['coolService', (coolService) ->
	@coolDown = (whatToCool) ->
		coolService.coolItDown whatToCool
]
```

Not a tremendous amount of improvement, but hey, at least it's CoffeeScript.

Let's now convert the main function to a CoffeeScript class.

```coffee
class coolController
	constructor: (coolService) ->
		@coolDown = (whatToCool) ->
			coolService.coolItDown whatToCool

angular.module({appName}).controller 'coolController', ['coolService', coolController]
```

So we've actually added a few lines of code.  Plus we're still dealing with some duplication, like AngularJS DI annotations.
Also, aren't CoffeeScript classes supposed to be capitalized by convention?

Now let's take advantage of ng-classify.

```coffee
class Cool extends Controller
	constructor: (coolService) ->
		@coolDown = (whatToCool) ->
			coolService.coolItDown whatToCool
```

Now there's no need to accomodate the AngularJS DI annotation, or use the word controller in a couple places, or mangle naming conventions.
Plus, the name of the app has been removed from the file.  It is now configurable.

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
coffeeScriptClass = '{CoffeeScript Class as a String}'
angularModule = ngClassify coffeeScriptClass
```

### JavaScript

```javascript
var ngClassify = require('ng-classify');
var coffeeScriptClass = '{CoffeeScript Class as a String}';
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