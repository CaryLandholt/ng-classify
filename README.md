# ng-classify
[![License][license-image]][license-url]
[![Version][version-image]][version-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][dependencies-image]][dependencies-url]
> Convert CoffeeScript classes to [AngularJS](http://angularjs.org/) modules  
> Write less JavaScript.  Write less CoffeeScript.  Write less Angular.
>
> Watch the [screencast](https://www.youtube.com/watch?v=28gUTu9vnB4)  
> [Demo](https://preview.c9.io/carylandholt/ng-classify-browserify/index.html)


## Install
Install with [npm](https://npmjs.org/package/ng-classify)

```bash
$ npm install ng-classify
```


## Usage


### CoffeeScript
```coffee
ngClassify = require 'ng-classify'

content = '''
class Home extends Controller
	constructor: ($log) ->
		$log.info 'homeController instantiated'
'''

angularModule = ngClassify content
```

### JavaScript
```javascript
var ngClassify = require('ng-classify');

var content = '\
class Home extends Controller\n\
	constructor: ($log) ->\n\
		$log.info \'homeController instantiated\'\
';

var angularModule = ngClassify(content);
```


### Gulp
[gulp-ng-classify](https://www.npmjs.org/package/gulp-ng-classify)
```bash
$ npm install gulp-ng-classify
```


### Grunt
[grunt-ng-classify](https://www.npmjs.org/package/grunt-ng-classify)
```bash
$ npm install grunt-ng-classify
```


### Ruby Gem
[ng_classify](https://rubygems.org/gems/ng_classify) - maintained by [pencilcheck](https://github.com/pencilcheck/ng_classify)
```bash
$ gem install ng_classify
```


### Brunch
[ng-classify-brunch](https://www.npmjs.com/package/ng-classify-brunch) - maintained by [andrejd](https://github.com/AndrejD/ng-classify-brunch)
```bash
$ npm install ng-classify-brunch
```


## Table of Contents
* [Install](#install)
* [Usage](#usage)
	- [CoffeeScript](#coffeescript)
	- [JavaScript](#javascript)
	- [Gulp](#gulp)
	- [Grunt](#grunt)
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
* [Multiple Apps](#multiple-apps)
* [API](#api)
* [Contributing](#contributing)
* [Changelog](#changelog)
* [License](#license)


## Overview
[AngularJS](http://angularjs.org/) is well suited to take advantage of the [CoffeeScript class](http://coffeescript.org/#classes) syntax.
However there's still a bit of boilerplate code we have to work through.
ng-classify addresses this.  *Note:  all examples are valid CoffeeScript.*

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
* Depending upon the desired naming format, module type (`controller`) and module name (`adminController`) have duplication, due to the suffixed `controller` in this example
* The function is anonymous (unnamed), making it more difficult to debug
* Generally verbose


### How?
Write AngularJS modules using the following syntaxes.
NOTE: `{{}}` denotes placeholders
```coffee
class {{appName}} extends {{Animation|Config|Controller|Directive|Factory|Filter|Provider|Run|Service}}
	constructor: ({{params}}) ->
		# module body here
```

or
```coffee
class {{name}} extends {{App|Constant|Value}}
	constructor: ->
		return {{value}}
```


### CoffeeScript Classes
The typical way to use CoffeeScript classes with AngularJS is as follows.
```coffee
# 203 characters
class AdminController
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()

angular.module('app').controller 'adminController', ['$scope', 'someService', AdminController]
```

which is equivalent to
```javascript
// 177 characters
angular.module('app').controller('adminController', ['$scope', 'someService', function AdminController ($scope, someService) {
	$scope.coolMethod = someService.coolMethod();
}]);
```

with ng-classify, this is all you need
```coffee
# 116 characters
class Admin extends Controller
	constructor: ($scope, someService) ->
		$scope.coolMethod = someService.coolMethod()
```


### Benefits
* Removes unnecessary ceremonial code (`angular.module('app')`)
* App name is not required when writing a module.  It is now configurable.
* Parameters are needed only once via the `constructor` function.  No need for the array syntax to make your code minifiable.
* No need to suffix the module name with the module type, e.g. my*Controller*, my*Ctrl*, etc.
* The function is named, making debugging more convenient
* The syntax is arguably concise.  Bring your code to the forefront with the elimination of cruft.


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
	constructor: ->
		return [
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

You may wish to use the `then` CoffeeScript syntax to highlight your code even more by eliminating the need for extra lines of code and indentation, as follows.  *Note:  this can be leveraged for any CoffeeScript class.*
```coffee
class App extends App then constructor: -> return [
	'ngAnimate'
	'ngRoute'
]
```

*Note:  the app name is configured via the [appName](#optionsappname) option, not the class name*


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
angular.module('app').animation('.my-crazy-fader', [function MyCrazyFader () {
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
}]);
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
angular.module('app').config(['$routeProvider', function Routes ($routeProvider) {
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
}]);
```


### Constant
```coffee
class HttpStatusCodes extends Constant
	constructor: ->
		return {
			'401': 'Unauthorized'
			'403': 'Forbidden'
			'404': 'Not Found'
		}
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
angular.module('app').controller('homeController', ['userService', function Home (userService) {
	this.save = function (username) {
		return userService.addUser(username);
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
angular.module('app').directive('dialog', [function Dialog () {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: 'dialog.html'
	};
}]);
```


### Factory
```coffee
class Greeting extends Factory
	constructor: ($log) ->
		return {
			sayHello: (name) ->
				$log.info name
		}
```

equivalent to
```javascript
angular.module('app').factory('Greeting', ['$log', function Greeting ($log) {
	return {
		sayHello: function (name) {
			$log.info(name);
		}
	};
}]);
```

Another nice feature is the ability to **return** classes
```coffee
class User extends Factory
	constructor: ($log) ->
		return class UserInstance
			constructor: (firstName, lastName) ->
				@getFullName = ->
					"#{firstName} #{lastName}"
```

usage
```coffee
user = new User 'Cary', 'Landholt'
fullName = user.getFullName() # Cary Landholt
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
angular.module('app').filter('twitterfy', [function Twitterfy () {
	return function (username) {
		return '@' + username;
	};
}]);
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
angular.module('app').provider('greetingsProvider', ['$log', function Greetings ($log) {
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
angular.module('app').run(['$httpBackend', function ViewsBackend ($httpBackend) {
	$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough();
}]);
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
angular.module('app').service('greetingService', ['$log', function Greeting ($log) {
	this.sayHello = function (name) {
		return $log.info(name);
	};
}]);
```


### Value
```coffee
class People extends Value
	constructor: ->
		return [
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


## Multiple Apps
Although using multiple apps in an AngularJS application is unnecessary, some may
still wish to do so.

Simply provide the app name as a parameter to the module type.

In the example below, a Controller is created within the 'common' app.
```coffee
class Home extends Controller('common')
	constructor: ($log) ->
		$log.info 'homeController instantiated'
```

equivalent to

```javascript
angular.module('common').controller('homeController', ['$log', function ($log) {
	$log.info('homeController instantiated');
})];
```


## API


### ngClassify(content, options)


#### content
*Required*  
Type: `String`  
Default: `undefined`  

The content that may contain CoffeeScript classes to convert to AngularJS modules


#### options
Type: `Object`  
Default: `undefined`  


##### options.appName
Type: `String`  
Default: `'app'`  

The name of the AngularJS app
```javascript
// for example
angular.module('app')
```


##### options.prefix
Type: `String`  
Default: `''`  

To avoid potential collisions, the moduleType prefix may be set (ex: `options.prefix = 'Ng'`)
```coffee
class Home extends Ng.Controller
	constructor: ($log) ->
		$log.info 'homeController instantiated'
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
* | *no change*
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
