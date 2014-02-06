# ng-classify [![Build Status](https://secure.travis-ci.org/CaryLandholt/ng-classify.png)](http://travis-ci.org/CaryLandholt/ng-classify)

> Convert CoffeeScript classes to [AngularJS](http://angularjs.org/) modules

[![NPM version](https://badge.fury.io/js/ng-classify.png)](http://badge.fury.io/js/ng-classify)
[![dependency status](https://david-dm.org/CaryLandholt/ng-classify.png)](https://david-dm.org/CaryLandholt/ng-classify)

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
Also, arent' CoffeeScript classes supposed to be capitalized by convention?

Now let's take advantage of ng-classify.

```coffee
class Cool extends Controller
	constructor: (coolService) ->
		@coolDown = (whatToCool) ->
			coolService.coolItDown whatToCool
```

Now there's no need to accomodate the AngularJS DI annotation, or use the word controller in a couple places, or mangle naming conventions.
Plus, the name of the app has been removed from the file.  It is now configurable.

### Config

```coffee
class Routes extends Config
	constructor: ($routeProvider) ->
		$routeProvider
		.when '/home',
			controller: 'homeController'
		.when '/about',
			controller: 'aboutController'
		.otherwise
			redirectTo: '/home'
```

equivalent to

```javascript
angular.module({appName}).config(['$routeProvider', function ($routeProvider) {
	$routeProvider
	.when('/home', {controller: 'homeController'})
	.when('/about', {controller: 'aboutController'})
	.otherwise({redirectTo: '/home'});
}]);
```

### Constant

```coffee
class Statuses extends Constant
	constant:
		'403': 'Forbidden'
```

equivalent to

```javascript
angular.module({appName}).constant('STATUSES', {'403': 'Forbidden'});
```

### Controller
```coffee
class Cool extends Controller
	constructor: (coolService) ->
		@coolDown = (whatToCool) ->
			coolService.coolItDown whatToCool
```

equivalent to

```javascript
angular.module({appName}).controller('coolController', ['coolService', function (coolService) {
	this.coolDown = function (whatToCool) {
		coolService.coolItDown(whatToCool);
	};
}]);
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
angular.module({appName}).directive('dialog', [function () {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: 'dialog.html'
	};
}]);
```

### Factory
```coffee
class Collection extends Factory
	constructor: ($log) ->
		return {
			sayHello: (name) ->
				$log.info name
		}
```

equivalent to

```javascript
angular.module({appName}).factory('Collection', [function () {
	return {
		sayHello: function (name) {
			$log.info name
		}
	};
}]);
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
angular.module({appName}).filter('twitterfy', [function () {
	return function (username) {
		return '@' + username;
	};
}]);
```

### Run

```coffee
class ViewsBackend extends Run
	constructor: ($httpBackend) ->
		$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough()
```

equivalent to

```javascript
angular.module({appName}).run(['$httpBackend', function ($httpBackend) {
	$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough();
}]);
```

### Service
```coffee
class Collection extends Service
	constructor: ($log) ->
		@sayHello: (name) ->
			$log.info name
```

equivalent to

```javascript
angular.module({appName}).service('collectionService', [function () {
	this.sayHello - function (name) {
		$log.info(name);
	};
}]);
```

### Value

```coffee
class People extends Value
	value: [
			{name: 'Saasha', age: 6}
			{name: 'Planet', age: 8}
		]
```

equivalent to

```javascript
angular.module({appName}).value('people', [{name: 'Saasha', age: 6}, {name: 'Planet', age: 8}]);
```


## Install

Install with [npm](https://npmjs.org/package/ng-classify)

```shell
npm install --save-dev ng-classify
```

## Examples

### CoffeeScript

```CoffeeScript
ngClassify = require 'ng-classify'
coffeeScriptClass = '' # CoffeeScript Class as a String
angularModule = ngClassify coffeeScriptClass
```

### JavaScript

```javascript
var ngClassify = require('ng-classify');
var coffeeScriptClass = ''; // CoffeeScript Class as a String
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