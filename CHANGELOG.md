### 4.1.1 (2015-01-31)


#### Bug Fixes

* **dist:** add missing dist to npm ([f7a34214](https://github.com/CaryLandholt/ng-classify/commit/f7a3421491c11240c3abb59514f593bae33e51e3))


## 4.1.0 (2015-01-31)


#### Features

* **commonjs:** add commonjs bundle ([fe0db907](https://github.com/CaryLandholt/ng-classify/commit/fe0db907692799b0cbc72a07565393e9b6484ff6))


### 4.0.3 (2014-12-04)


#### Bug Fixes

* **App:** prefix new keyword to App() constructor function ([d8e1c8a4](https://github.com/CaryLandholt/ng-classify/commit/d8e1c8a4b9a00c98ef7f7f0bd760a2cc30cd8dc3), closes [#27](https://github.com/CaryLandholt/ng-classify/issues/27))


#### Features

* **wrappedClasses:** add support for wrapped classes ([c9a062f0](https://github.com/CaryLandholt/ng-classify/commit/c9a062f0a85b35bec0f4a677ab1e831cf560488c))


### 4.0.2 (2014-08-17)


#### Bug Fixes

* **eval:** add allowUnsafeEval via loophole ([9d7ebd69](https://github.com/CaryLandholt/ng-classify/commit/9d7ebd69e25ba9b2e377b3b58927bcc0609ae1a0))


### 4.0.1 (2014-08-14)


#### Bug Fixes

* **ambiguous-coffee-script:** ensure compilation is unambiguous ([a73cedc3](https://github.com/CaryLandholt/ng-classify/commit/a73cedc356afd7705ee8af9fa7c94149a68c41a7), closes [#20](https://github.com/CaryLandholt/ng-classify/issues/20))

Although ng-classify produces valid CoffeeScript, other dependencies may use an older version of the CoffeeScript compiler that may not.  
This isn't a bug fix as much as a friendly tweak.

Before:
```coffee
angular.module 'app'
.controller 'homeController', [Home]
```

After:
```coffee
angular.module('app')
.controller('homeController', [Home])
```


## 4.0.0 (2014-08-10)


#### Features

* **multipleApps:**
  * add newline between app statements ([9b01b5e6](https://github.com/CaryLandholt/ng-classify/commit/9b01b5e61d98d7cb181f9abb1013bf2a719fac2f))
  * add support for multiple apps ([1e719d42](https://github.com/CaryLandholt/ng-classify/commit/1e719d4200c19c649130eccf324bca86a5a8fc88))
  * add support for multiple apps ([2f8f6c8f](https://github.com/CaryLandholt/ng-classify/commit/2f8f6c8ff7bf53db39b7d32613c027dab1acabc9))

```coffee
class Home extends Controller('my.app.name')
```


## 3.1.0 (2014-07-04)


#### Features

* **moduleChaining:** chain multiple module declarations ([0e9d4c5e](https://github.com/CaryLandholt/ng-classify/commit/0e9d4c5ea6deb2c4feb5b3e19cd5885d6fbff2a5))

Before:
```coffee
angular.module('app').controller 'homeController', [Home]
angular.module('app').service 'aboutService', [About]
```

After:
```coffee
angular.module('app')
.controller 'homeController', [Home]
.service 'aboutService', [About]
```


### 3.0.1 (2014-07-02)


#### Bug Fixes

* **package.json:** ensure semver compliance ([31166288](https://github.com/CaryLandholt/ng-classify/commit/311662889922f08882dada8090eea020ab39261a))


## 3.0.0 (2014-06-18)


#### Bug Fixes

* **classDetails:** add support for do in the constructor ([38b088f9](https://github.com/CaryLandholt/ng-classify/commit/38b088f9e40e1c8f6c813cf386614fbfe5d22b4b), closes [#8](https://github.com/CaryLandholt/ng-classify/issues/8))


#### Breaking Changes

* use return value from constructor

Before:
```coffee
class MyValue extends Value
  @constructor = 'Hello'
```

After:
```coffee
class MyValue extends Value
  constructor: ->
    return 'Hello'
```

 ([b9e85814](https://github.com/CaryLandholt/ng-classify/commit/b9e85814f1b9957cf7647df31e9a1695af3ef337))
* use return value from constructor

Before:
```coffee
class MyConst extends Constant
  @constructor = []
```

After:
```coffee
class MyConst extends Constant
  constructor: ->
    return []
```

 ([3620e03b](https://github.com/CaryLandholt/ng-classify/commit/3620e03b35f61b6b9670eb1e5b4cc4848224736d))
* use return value from constructor

Before:
```coffee
class App extends App
  @constructor = []
```

After:
```coffee
class App extends App
  constructor: ->
    return []
```

 ([fda5a79b](https://github.com/CaryLandholt/ng-classify/commit/fda5a79b12014893110916c10df017fd594fbc65))


## 2.0.0 (2014-06-13)


#### Features

* **data:** leverage other modules ([ee70d196](https://github.com/CaryLandholt/ng-classify/commit/ee70d196e5671955345a4b5b7c55d86441bce28c))
* **format:** add * format option ([dcc2029c](https://github.com/CaryLandholt/ng-classify/commit/dcc2029c0cec3ff268e69f1b236a88498e2d58ae))


#### Breaking Changes

* options.data deprecated

Use gulp-template or another similar library instead

 ([ee70d196](https://github.com/CaryLandholt/ng-classify/commit/ee70d196e5671955345a4b5b7c55d86441bce28c))


### 1.0.2 (2014-06-09)


#### Bug Fixes

* **index:** add bridge from js to coffee ([298aad76](https://github.com/CaryLandholt/ng-classify/commit/298aad76d3601b2942c405cb807e021612278fb8))


<a name="1.0.1"></a>
### 1.0.1  (2014-05-04)


#### Bug Fixes

* **moduleTypePrefix:** remove prefix from moduleType when formatting ([f752ca7d](https://github.com/CaryLandholt/ng-classify/commit/f752ca7d4e17e5a6e83d281731f881a94668e3ae), closes [#7](https://github.com/CaryLandholt/ng-classify/issues/7))


<a name="1.0.0"></a>
## 1.0.0  (2014-05-04)


#### Bug Fixes

* **content:**
  * allow multiple classes ([253d2d1b](https://github.com/CaryLandholt/ng-classify/commit/253d2d1b43aa0fb8318603199c79a7f5f1c09ada), closes [#5](https://github.com/CaryLandholt/ng-classify/issues/5))
  * allow multiple classes ([3dd0f4e2](https://github.com/CaryLandholt/ng-classify/commit/3dd0f4e25c3127033d29d16d1c94a14bc78e953c))


#### Features

* **moduleTypePrefix:** enable namespacing of moduleTypes ([49f46653](https://github.com/CaryLandholt/ng-classify/commit/49f46653ef243ac899be76835a8fa1504c638ad4))


<a name="0.5.3"></a>
### 0.5.3  (2014-05-04)


#### Bug Fixes

* **ng-classify:** use recursion to gather nested classes ([079f3404](https://github.com/CaryLandholt/ng-classify/commit/079f34040adab6350262611b1575f50c47d5bf00), closes [#4](https://github.com/CaryLandholt/ng-classify/issues/4))


<a name="0.5.2"></a>
### 0.5.2  (2014-05-03)


#### Bug Fixes

* **comments:** iterate properties properly ([05138b88](https://github.com/CaryLandholt/ng-classify/commit/05138b88432b0266dcd40a07bece8e5426475953), closes [#3](https://github.com/CaryLandholt/ng-classify/issues/3))


<a name="0.5.1"></a>
### 0.5.1  (2014-05-02)


#### Bug Fixes

* **coffee-script:** move coffee-script to dependencies ([a92f54b3](https://github.com/CaryLandholt/ng-classify/commit/a92f54b3fe696250f5807d2b8165a41241418f4a))


<a name="0.5.0"></a>
## 0.5.0  (2014-05-02)


#### Bug Fixes

* **parsing:** remove regex parsing, use coffee-script nodes ([194c5917](https://github.com/CaryLandholt/ng-classify/commit/194c5917b83b3f485d22ef6292797f58d9624fbd))


<a name="0.4.2"></a>
## 0.4.2  (2014-03-20)


#### Bug Fixes

* **format:** screamingSnakeCase and snakeCase missing assignment ([bc977c6b](https://github.com/CaryLandholt/ng-classify/commit/bc977c6b0a95b4ab92e4454db01ddf073a0b4e14))
* **ngClassify:** Return original content if ng-classify pattern is not found ([5e627075](https://github.com/CaryLandholt/ng-classify/commit/5e62707556306788b57d0a6dd2a42090f5c43ced), closes [#2](https://github.com/CaryLandholt/ng-classify/issues/2))


#### Features

* **Animation:** add support for Animation class type ([99cdbe01](https://github.com/CaryLandholt/ng-classify/commit/99cdbe01c974ea4f64d146697390a507535eaae7), closes [#1](https://github.com/CaryLandholt/ng-classify/issues/1))
* **App:** add support for app module ([2907c997](https://github.com/CaryLandholt/ng-classify/commit/2907c99704e85de92c5e96586c588265ca465c55))
* **options:** format, prefix, and suffix are configurable ([aa7a047e](https://github.com/CaryLandholt/ng-classify/commit/aa7a047e2b4a1666d5f67f83991b63bce1cb1d0c))