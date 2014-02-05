[![NPM version](https://badge.fury.io/js/ng-classify.png)](http://badge.fury.io/js/ng-classify)
[![dependency status](https://david-dm.org/CaryLandholt/ng-classify.png)](https://david-dm.org/CaryLandholt/ng-classify)

# ng-classify [![Build Status](https://secure.travis-ci.org/CaryLandholt/gulp-ng-classify.png)](http://travis-ci.org/CaryLandholt/gulp-ng-classify)

> Convert CoffeeScript classes to [AngularJS](http://angularjs.org/) modules

## Overview

[AngularJS](http://angularjs.org/) is well suited to take advantage of the terse CoffeeScript class syntax.
However there's still a bit of boilerplate code we have to work through.
ng-classify makes it easy.

Take the following AngularJS module written in JavaScript.

```JavaScript
angular.module('app').controller('coolController', ['coolService', function (coolService) {
	this.coolDown = function (whatToCool) {
		coolService.coolItDown(whatToCool);
	};
}]);
```

Now let's convert it to CoffeeScript

```CoffeeScript
angular.module('app').controller 'coolController', ['coolService', (coolService) ->
	@coolDown = (whatToCool) ->
		coolService.coolItDown whatToCool
]
```

Not a tremendous amount of improvement, but hey, at least it's CoffeeScript.

Let's now convert the main function to a CoffeeScript class.

```CoffeeScript
class coolController
	constructor: (coolService) ->
		@coolDown = (whatToCool) ->
			coolService.coolItDown whatToCool

angular.module('app').controller 'coolController', ['coolService', coolController]
```

So we've actually added a few lines of code.  Plus we're still dealing with some duplication, like AngularJS DI annotations.
Also, arent' CoffeeScript classes supposed to be capitalized by convention?

Now let's take advantage of ng-classify.

```CoffeeScript
class Cool extends Controller
	constructor: (coolService) ->
		@coolDown = (whatToCool) ->
			coolService.coolItDown whatToCool
```

Now there's no need to accomodate the AngularJS DI annotation, or use the word controller in a couple places, or mangle naming conventions.
Plus, the name of the app has been removed from the file.  It is now configurable.

### Config

```CoffeeScript
class MyInterceptor extends Config
	constructor: ($httpProvider) ->
		$httpProvider.interceptors.push 'MyInterceptor'
```

### Run

```CoffeeScript
class ViewsBackend extends Run
	constructor: ($httpBackend) ->
		$httpBackend.whenGET(/^.*\.(html|htm)$/).passThrough()
```

## Install

Install with [npm](https://npmjs.org/package/ng-classify)

```Bash
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

```JavaScript
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
