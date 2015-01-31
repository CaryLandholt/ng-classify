// ng-classify v4.1.1
module.exports = (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var classDetails, extend, formatOptions, moduleDetails, moduleOptions, moduleTypes;

classDetails = require('./lib/classDetails');

extend = require('node.extend');

formatOptions = require('./lib/formatOptions');

moduleDetails = require('./lib/moduleDetails');

moduleOptions = require('./lib/moduleOptions');

moduleTypes = require('./lib/moduleTypes');

module.exports = function(content, options) {
  var app, appName, apps, contentLines, details, formatOpts, getTrimmedContent, lines, modDetails, modTypes, ngClassified, opts;
  formatOpts = formatOptions(options);
  opts = moduleOptions(formatOpts, options);
  modTypes = moduleTypes(opts.prefix);
  appName = !opts.appName ? 'app' : opts.appName;
  details = classDetails(content, modTypes);
  contentLines = content.split('\n');
  getTrimmedContent = function(contentLines, position) {
    var characters, end, i, line, lineContent, lines, row, start, _i, _ref;
    lines = contentLines.slice(0);
    row = position.row;
    start = position.start;
    end = position.end;
    lineContent = lines[row];
    characters = lineContent.split('');
    for (i = _i = _ref = start + 1; _ref <= end ? _i <= end : _i >= end; i = _ref <= end ? ++_i : --_i) {
      delete characters[i];
    }
    line = characters.join('');
    lines[row] = line;
    return lines;
  };
  apps = {};
  details.forEach(function(detail) {
    var modDetails, moduleAppName;
    moduleAppName = !detail.appName ? appName : detail.appName;
    modDetails = moduleDetails(extend(true, detail, {
      appName: moduleAppName
    }), opts);
    contentLines = getTrimmedContent(contentLines, detail.position);
    if (!apps[moduleAppName]) {
      apps[moduleAppName] = {};
    }
    if (detail.moduleType === 'App') {
      if (!apps[moduleAppName].appTypes) {
        apps[moduleAppName].appTypes = [];
      }
      return apps[moduleAppName].appTypes.push(modDetails);
    } else {
      if (!apps[moduleAppName].nonAppTypes) {
        apps[moduleAppName].nonAppTypes = [];
      }
      return apps[moduleAppName].nonAppTypes.push(modDetails);
    }
  });
  lines = [];
  for (app in apps) {
    modDetails = apps[app];
    if (lines.length !== 0) {
      lines.push('');
    }
    if (modDetails.appTypes) {
      modDetails.appTypes.forEach(function(appType) {
        return lines.push(appType);
      });
    } else {
      lines.push("angular.module('" + app + "')");
    }
    if (modDetails.nonAppTypes && modDetails.nonAppTypes.length > 0) {
      modDetails.nonAppTypes.forEach(function(nonAppType) {
        return lines.push(nonAppType);
      });
    }
  }
  ngClassified = contentLines.join('\n');
  if (lines.length) {
    ngClassified += '\n\n';
  }
  return ngClassified += lines.join('\n');
};



},{"./lib/classDetails":4,"./lib/formatOptions":5,"./lib/moduleDetails":6,"./lib/moduleOptions":7,"./lib/moduleTypes":8,"node.extend":24}],2:[function(require,module,exports){
var changeCase;

changeCase = require('./changeCase');

module.exports = function(input, filters) {
  var filter, _i, _len;
  for (_i = 0, _len = filters.length; _i < _len; _i++) {
    filter = filters[_i];
    input = changeCase(input, filter);
  }
  return input;
};



},{"./changeCase":3}],3:[function(require,module,exports){
var caseChangeRegEx;

caseChangeRegEx = /([a-z\d])([A-Z])/g;

module.exports = function(input, caseFormat) {
  if (caseFormat === '*') {
    return input;
  }
  if (caseFormat === 'camelCase' || caseFormat === 'lowerCamelCase') {
    return input[0].toLowerCase() + input.slice(1);
  }
  if (caseFormat === 'lowerCase') {
    return input.toLowerCase();
  }
  if (caseFormat === 'screamingSnakeCase') {
    return input.replace(/-/g, '_').replace(caseChangeRegEx, '$1_$2').toUpperCase();
  }
  if (caseFormat === 'snakeCase') {
    return input.replace(/-/g, '_').replace(caseChangeRegEx, '$1_$2').toLowerCase();
  }
  if (caseFormat === 'spinalCase') {
    return input.replace(/_/g, '-').replace(caseChangeRegEx, '$1-$2').toLowerCase();
  }
  if (caseFormat === 'trainCase') {
    input = input.replace(/_/g, '-');
    return input.replace(caseChangeRegEx, '$1-$2')[0].toUpperCase() + input.replace(caseChangeRegEx, '$1-$2').slice(1);
  }
  if (caseFormat === 'upperCamelCase') {
    return input[0].toUpperCase() + input.slice(1);
  }
  if (caseFormat === 'upperCase') {
    return input.toUpperCase();
  }
  throw new Error("invalid caseFormat '" + caseFormat + "'");
};



},{}],4:[function(require,module,exports){
var allowUnsafeEval, coffeeScript, nodes,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

allowUnsafeEval = require('loophole').allowUnsafeEval;

coffeeScript = require('coffee-script');

nodes = coffeeScript.nodes;

module.exports = function(content, moduleTypes) {
  var classDetails, isAngularModuleType, normalizeParameters, processNode, processNodes;
  classDetails = [];
  isAngularModuleType = function(moduleType) {
    return __indexOf.call(moduleTypes, moduleType) >= 0;
  };
  processNode = function(node) {
    var appName, base, body, classLocation, className, hasAppName, hasProperties, hasWrapper, isAngular, isClass, isConstructor, isDo, isExtends, isNamespaced, moduleType, namespaces, parameters, params, parent, position, properties, property, _i, _len, _ref, _ref1, _ref2, _ref3;
    appName = null;
    if (node.expression) {
      node = node.expression;
    }
    body = node.body;
    isClass = node.variable && node.parent && (body != null ? body.classBody : void 0);
    if (isClass) {
      base = node.variable.base;
      className = base.value;
      classLocation = base.locationData;
      parent = node.parent;
      isExtends = parent != null;
      position = {
        row: classLocation.last_line,
        start: classLocation.last_column
      };
      if (!isExtends) {
        return;
      }
      base = parent.base;
      hasAppName = !base;
      if (hasAppName) {
        moduleType = parent.variable.base.value;
        position.end = parent.locationData.last_column;
        parent = parent.args[0];
        base = parent.base;
        appName = base.value;
        if (typeof appName !== 'string') {
          throw new Error('appName must be a string');
        }
        appName = allowUnsafeEval(function() {
          return eval(appName);
        });
      } else {
        position.end = base.locationData.last_column;
        moduleType = base.value;
      }
      properties = parent.properties;
      isNamespaced = properties.length > 0;
      if (isNamespaced) {
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          property = properties[_i];
          position.end = property.locationData.last_column;
        }
        namespaces = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
            property = properties[_j];
            _results.push(property.name.value);
          }
          return _results;
        })();
        moduleType += '.' + namespaces.join('.');
      }
      isAngular = isAngularModuleType(moduleType);
      if (!isAngular) {
        return;
      }
      classDetails.push({
        className: className,
        moduleType: moduleType,
        appName: appName,
        parameters: [],
        position: position
      });
      return processNodes(body.expressions);
    }
    hasWrapper = (node != null ? (_ref = node.args) != null ? (_ref1 = _ref[0]) != null ? (_ref2 = _ref1.body) != null ? _ref2.expressions : void 0 : void 0 : void 0 : void 0) != null;
    if (hasWrapper) {
      return processNodes(node.args[0].body.expressions);
    }
    base = node.base;
    hasProperties = base != null ? base.properties : void 0;
    if (hasProperties) {
      return processNodes(base.properties);
    }
    isConstructor = node.value && ((_ref3 = node.variable) != null ? _ref3.base.value : void 0) === 'constructor';
    if (!isConstructor) {
      return;
    }
    params = node.value.params;
    isDo = node.value["do"] != null;
    parameters = [];
    if (isDo) {
      return classDetails[classDetails.length - 1].parameters = parameters;
    }
    params.forEach(function(param) {
      var isThis, props;
      isThis = param.name["this"] != null;
      if (isThis) {
        properties = param.name.properties;
        props = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
            property = properties[_j];
            _results.push(property.name.value);
          }
          return _results;
        })();
        return parameters.push(props);
      }
      return parameters.push(param.name.value);
    });
    classDetails[classDetails.length - 1].parameters = parameters;
    return processNodes(node.value.body.expressions);
  };
  processNodes = function(nodes) {
    var node, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      _results.push(processNode(node));
    }
    return _results;
  };
  normalizeParameters = function() {
    return classDetails.forEach(function(details) {
      var hasParameters, i, parameter, _i, _len, _ref;
      hasParameters = details.parameters != null;
      if (!hasParameters) {
        return;
      }
      _ref = details.parameters;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        parameter = _ref[i];
        details.parameters[i] = "'" + parameter + "'";
      }
      return details.parameters.push(details.className);
    });
  };
  processNodes(nodes(content).expressions);
  normalizeParameters();
  return classDetails;
};



},{"coffee-script":9,"loophole":23}],5:[function(require,module,exports){
var extend;

extend = require('node.extend');

module.exports = function(options) {
  var formatOptions, k, merged, prefix, suffix, v;
  formatOptions = {
    animation: {
      format: 'spinalCase',
      prefix: '.'
    },
    constant: {
      format: 'screamingSnakeCase'
    },
    controller: {
      format: 'camelCase',
      suffix: 'Controller'
    },
    directive: {
      format: 'camelCase'
    },
    factory: {
      format: 'upperCamelCase'
    },
    filter: {
      format: 'camelCase'
    },
    provider: {
      format: 'camelCase',
      suffix: 'Provider'
    },
    service: {
      format: 'camelCase',
      suffix: 'Service'
    },
    value: {
      format: 'camelCase'
    }
  };
  for (k in formatOptions) {
    v = formatOptions[k];
    prefix = formatOptions[k].prefix;
    suffix = formatOptions[k].suffix;
    if (!prefix) {
      formatOptions[k].prefix = '';
    }
    if (!suffix) {
      formatOptions[k].suffix = '';
    }
  }
  return merged = extend(true, formatOptions, options);
};



},{"node.extend":24}],6:[function(require,module,exports){
var applyCaseFilters;

applyCaseFilters = require('./applyCaseFilters');

module.exports = function(details, options) {
  var compiled, format, output, parts, prefixLessModuleType;
  prefixLessModuleType = details.moduleType.split('.').slice(-1)[0];
  format = options.formats[prefixLessModuleType.toLowerCase()];
  parts = format.split(/{{(.*?)}}/);
  compiled = [];
  parts.forEach(function(part) {
    var component, detail, filters, key;
    filters = part.split('|');
    component = filters[0];
    detail = details[component];
    if (component === 'parameters') {
      detail = detail.join(', ');
      filters = filters.filter(function(filter, i) {
        return i > 0;
      });
    }
    if (filters.length > 1) {
      filters = filters.slice(1);
      key = component === 'moduleType' ? prefixLessModuleType : detail;
      detail = applyCaseFilters(key, filters);
    }
    return compiled.push(detail ? detail : component);
  });
  return output = compiled.join('');
};



},{"./applyCaseFilters":2}],7:[function(require,module,exports){
var extend;

extend = require('node.extend');

module.exports = function(formatOptions, options) {
  var merged, moduleOptions;
  moduleOptions = {
    appName: 'app',
    formats: {
      animation: ".{{moduleType|lowerCase}}('" + formatOptions.animation.prefix + "{{className|" + formatOptions.animation.format + "}}" + formatOptions.animation.suffix + "', [{{parameters}}])",
      app: "angular.module('{{appName}}', new {{className}}())",
      config: ".{{moduleType|lowerCase}}([{{parameters}}])",
      constant: ".{{moduleType|lowerCase}}('" + formatOptions.constant.prefix + "{{className|" + formatOptions.constant.format + "}}" + formatOptions.constant.suffix + "', {{className}}())",
      controller: ".{{moduleType|lowerCase}}('" + formatOptions.controller.prefix + "{{className|" + formatOptions.controller.format + "}}" + formatOptions.controller.suffix + "', [{{parameters}}])",
      directive: ".{{moduleType|lowerCase}}('" + formatOptions.directive.prefix + "{{className|" + formatOptions.directive.format + "}}" + formatOptions.directive.suffix + "', [{{parameters}}])",
      factory: ".{{moduleType|lowerCase}}('" + formatOptions.factory.prefix + "{{className|" + formatOptions.factory.format + "}}" + formatOptions.factory.suffix + "', [{{parameters}}])",
      filter: ".{{moduleType|lowerCase}}('" + formatOptions.filter.prefix + "{{className|" + formatOptions.filter.format + "}}" + formatOptions.filter.suffix + "', [{{parameters}}])",
      provider: ".{{moduleType|lowerCase}}('" + formatOptions.provider.prefix + "{{className|" + formatOptions.provider.format + "}}" + formatOptions.provider.suffix + "', [{{parameters}}])",
      run: ".{{moduleType|lowerCase}}([{{parameters}}])",
      service: ".{{moduleType|lowerCase}}('" + formatOptions.service.prefix + "{{className|" + formatOptions.service.format + "}}" + formatOptions.service.suffix + "', [{{parameters}}])",
      value: ".{{moduleType|lowerCase}}('" + formatOptions.value.prefix + "{{className|" + formatOptions.value.format + "}}" + formatOptions.value.suffix + "', {{className}}())"
    },
    prefix: ''
  };
  return merged = extend(true, moduleOptions, options);
};



},{"node.extend":24}],8:[function(require,module,exports){
module.exports = function(prefix) {
  var moduleType, moduleTypes;
  if (prefix == null) {
    prefix = '';
  }
  if (prefix !== '' && prefix.slice(-1) !== '.') {
    prefix += '.';
  }
  moduleTypes = ['Animation', 'App', 'Config', 'Constant', 'Controller', 'Directive', 'Factory', 'Filter', 'Provider', 'Run', 'Service', 'Value'];
  return moduleTypes = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = moduleTypes.length; _i < _len; _i++) {
      moduleType = moduleTypes[_i];
      _results.push("" + prefix + moduleType);
    }
    return _results;
  })();
};



},{}],9:[function(require,module,exports){
(function (process,global){
// Generated by CoffeeScript 1.9.0
(function() {
  var Lexer, SourceMap, compile, ext, formatSourcePosition, fs, getSourceMap, helpers, lexer, parser, path, sourceMaps, vm, withPrettyErrors, _base, _i, _len, _ref,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  vm = require('vm');

  path = require('path');

  Lexer = require('./lexer').Lexer;

  parser = require('./parser').parser;

  helpers = require('./helpers');

  SourceMap = require('./sourcemap');

  exports.VERSION = '1.9.0';

  exports.FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];

  exports.helpers = helpers;

  withPrettyErrors = function(fn) {
    return function(code, options) {
      var err;
      if (options == null) {
        options = {};
      }
      try {
        return fn.call(this, code, options);
      } catch (_error) {
        err = _error;
        throw helpers.updateSyntaxError(err, code, options.filename);
      }
    };
  };

  exports.compile = compile = withPrettyErrors(function(code, options) {
    var answer, currentColumn, currentLine, extend, fragment, fragments, header, js, map, merge, newLines, token, tokens, _i, _len;
    merge = helpers.merge, extend = helpers.extend;
    options = extend({}, options);
    if (options.sourceMap) {
      map = new SourceMap;
    }
    tokens = lexer.tokenize(code, options);
    options.referencedVars = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        token = tokens[_i];
        if (token.variable && token[1].charAt(0) === '_') {
          _results.push(token[1]);
        }
      }
      return _results;
    })();
    fragments = parser.parse(tokens).compileToFragments(options);
    currentLine = 0;
    if (options.header) {
      currentLine += 1;
    }
    if (options.shiftLine) {
      currentLine += 1;
    }
    currentColumn = 0;
    js = "";
    for (_i = 0, _len = fragments.length; _i < _len; _i++) {
      fragment = fragments[_i];
      if (options.sourceMap) {
        if (fragment.locationData) {
          map.add([fragment.locationData.first_line, fragment.locationData.first_column], [currentLine, currentColumn], {
            noReplace: true
          });
        }
        newLines = helpers.count(fragment.code, "\n");
        currentLine += newLines;
        if (newLines) {
          currentColumn = fragment.code.length - (fragment.code.lastIndexOf("\n") + 1);
        } else {
          currentColumn += fragment.code.length;
        }
      }
      js += fragment.code;
    }
    if (options.header) {
      header = "Generated by CoffeeScript " + this.VERSION;
      js = "// " + header + "\n" + js;
    }
    if (options.sourceMap) {
      answer = {
        js: js
      };
      answer.sourceMap = map;
      answer.v3SourceMap = map.generate(options, code);
      return answer;
    } else {
      return js;
    }
  });

  exports.tokens = withPrettyErrors(function(code, options) {
    return lexer.tokenize(code, options);
  });

  exports.nodes = withPrettyErrors(function(source, options) {
    if (typeof source === 'string') {
      return parser.parse(lexer.tokenize(source, options));
    } else {
      return parser.parse(source);
    }
  });

  exports.run = function(code, options) {
    var answer, dir, mainModule, _ref;
    if (options == null) {
      options = {};
    }
    mainModule = require.main;
    mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : '.';
    mainModule.moduleCache && (mainModule.moduleCache = {});
    dir = options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync('.');
    mainModule.paths = require('module')._nodeModulePaths(dir);
    if (!helpers.isCoffee(mainModule.filename) || require.extensions) {
      answer = compile(code, options);
      code = (_ref = answer.js) != null ? _ref : answer;
    }
    return mainModule._compile(code, mainModule.filename);
  };

  exports["eval"] = function(code, options) {
    var Module, createContext, isContext, js, k, o, r, sandbox, v, _i, _len, _module, _ref, _ref1, _ref2, _ref3, _require;
    if (options == null) {
      options = {};
    }
    if (!(code = code.trim())) {
      return;
    }
    createContext = (_ref = vm.Script.createContext) != null ? _ref : vm.createContext;
    isContext = (_ref1 = vm.isContext) != null ? _ref1 : function(ctx) {
      return options.sandbox instanceof createContext().constructor;
    };
    if (createContext) {
      if (options.sandbox != null) {
        if (isContext(options.sandbox)) {
          sandbox = options.sandbox;
        } else {
          sandbox = createContext();
          _ref2 = options.sandbox;
          for (k in _ref2) {
            if (!__hasProp.call(_ref2, k)) continue;
            v = _ref2[k];
            sandbox[k] = v;
          }
        }
        sandbox.global = sandbox.root = sandbox.GLOBAL = sandbox;
      } else {
        sandbox = global;
      }
      sandbox.__filename = options.filename || 'eval';
      sandbox.__dirname = path.dirname(sandbox.__filename);
      if (!(sandbox !== global || sandbox.module || sandbox.require)) {
        Module = require('module');
        sandbox.module = _module = new Module(options.modulename || 'eval');
        sandbox.require = _require = function(path) {
          return Module._load(path, _module, true);
        };
        _module.filename = sandbox.__filename;
        _ref3 = Object.getOwnPropertyNames(require);
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          r = _ref3[_i];
          if (r !== 'paths') {
            _require[r] = require[r];
          }
        }
        _require.paths = _module.paths = Module._nodeModulePaths(process.cwd());
        _require.resolve = function(request) {
          return Module._resolveFilename(request, _module);
        };
      }
    }
    o = {};
    for (k in options) {
      if (!__hasProp.call(options, k)) continue;
      v = options[k];
      o[k] = v;
    }
    o.bare = true;
    js = compile(code, o);
    if (sandbox === global) {
      return vm.runInThisContext(js);
    } else {
      return vm.runInContext(js, sandbox);
    }
  };

  exports.register = function() {
    return require('./register');
  };

  if (require.extensions) {
    _ref = this.FILE_EXTENSIONS;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ext = _ref[_i];
      if ((_base = require.extensions)[ext] == null) {
        _base[ext] = function() {
          throw new Error("Use CoffeeScript.register() or require the coffee-script/register module to require " + ext + " files.");
        };
      }
    }
  }

  exports._compileFile = function(filename, sourceMap) {
    var answer, err, raw, stripped;
    if (sourceMap == null) {
      sourceMap = false;
    }
    raw = fs.readFileSync(filename, 'utf8');
    stripped = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
    try {
      answer = compile(stripped, {
        filename: filename,
        sourceMap: sourceMap,
        literate: helpers.isLiterate(filename)
      });
    } catch (_error) {
      err = _error;
      throw helpers.updateSyntaxError(err, stripped, filename);
    }
    return answer;
  };

  lexer = new Lexer;

  parser.lexer = {
    lex: function() {
      var tag, token;
      token = parser.tokens[this.pos++];
      if (token) {
        tag = token[0], this.yytext = token[1], this.yylloc = token[2];
        parser.errorToken = token.origin || token;
        this.yylineno = this.yylloc.first_line;
      } else {
        tag = '';
      }
      return tag;
    },
    setInput: function(tokens) {
      parser.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };

  parser.yy = require('./nodes');

  parser.yy.parseError = function(message, _arg) {
    var errorLoc, errorTag, errorText, errorToken, token, tokens;
    token = _arg.token;
    errorToken = parser.errorToken, tokens = parser.tokens;
    errorTag = errorToken[0], errorText = errorToken[1], errorLoc = errorToken[2];
    errorText = errorToken === tokens[tokens.length - 1] ? 'end of input' : errorTag === 'INDENT' || errorTag === 'OUTDENT' ? 'indentation' : helpers.nameWhitespaceCharacter(errorText);
    return helpers.throwSyntaxError("unexpected " + errorText, errorLoc);
  };

  formatSourcePosition = function(frame, getSourceMapping) {
    var as, column, fileLocation, fileName, functionName, isConstructor, isMethodCall, line, methodName, source, tp, typeName;
    fileName = void 0;
    fileLocation = '';
    if (frame.isNative()) {
      fileLocation = "native";
    } else {
      if (frame.isEval()) {
        fileName = frame.getScriptNameOrSourceURL();
        if (!fileName) {
          fileLocation = (frame.getEvalOrigin()) + ", ";
        }
      } else {
        fileName = frame.getFileName();
      }
      fileName || (fileName = "<anonymous>");
      line = frame.getLineNumber();
      column = frame.getColumnNumber();
      source = getSourceMapping(fileName, line, column);
      fileLocation = source ? fileName + ":" + source[0] + ":" + source[1] : fileName + ":" + line + ":" + column;
    }
    functionName = frame.getFunctionName();
    isConstructor = frame.isConstructor();
    isMethodCall = !(frame.isToplevel() || isConstructor);
    if (isMethodCall) {
      methodName = frame.getMethodName();
      typeName = frame.getTypeName();
      if (functionName) {
        tp = as = '';
        if (typeName && functionName.indexOf(typeName)) {
          tp = typeName + ".";
        }
        if (methodName && functionName.indexOf("." + methodName) !== functionName.length - methodName.length - 1) {
          as = " [as " + methodName + "]";
        }
        return "" + tp + functionName + as + " (" + fileLocation + ")";
      } else {
        return typeName + "." + (methodName || '<anonymous>') + " (" + fileLocation + ")";
      }
    } else if (isConstructor) {
      return "new " + (functionName || '<anonymous>') + " (" + fileLocation + ")";
    } else if (functionName) {
      return functionName + " (" + fileLocation + ")";
    } else {
      return fileLocation;
    }
  };

  sourceMaps = {};

  getSourceMap = function(filename) {
    var answer, _ref1;
    if (sourceMaps[filename]) {
      return sourceMaps[filename];
    }
    if (_ref1 = path != null ? path.extname(filename) : void 0, __indexOf.call(exports.FILE_EXTENSIONS, _ref1) < 0) {
      return;
    }
    answer = exports._compileFile(filename, true);
    return sourceMaps[filename] = answer.sourceMap;
  };

  Error.prepareStackTrace = function(err, stack) {
    var frame, frames, getSourceMapping;
    getSourceMapping = function(filename, line, column) {
      var answer, sourceMap;
      sourceMap = getSourceMap(filename);
      if (sourceMap) {
        answer = sourceMap.sourceLocation([line - 1, column - 1]);
      }
      if (answer) {
        return [answer[0] + 1, answer[1] + 1];
      } else {
        return null;
      }
    };
    frames = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = stack.length; _j < _len1; _j++) {
        frame = stack[_j];
        if (frame.getFunction() === exports.run) {
          break;
        }
        _results.push("  at " + (formatSourcePosition(frame, getSourceMapping)));
      }
      return _results;
    })();
    return (err.toString()) + "\n" + (frames.join('\n')) + "\n";
  };

}).call(this);

}).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./helpers":10,"./lexer":11,"./nodes":12,"./parser":13,"./register":14,"./sourcemap":17,"IrXUsu":20,"fs":18,"module":18,"path":19,"vm":21}],10:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.9.0
(function() {
  var buildLocationData, extend, flatten, last, repeat, syntaxErrorToString, _ref;

  exports.starts = function(string, literal, start) {
    return literal === string.substr(start, literal.length);
  };

  exports.ends = function(string, literal, back) {
    var len;
    len = literal.length;
    return literal === string.substr(string.length - len - (back || 0), len);
  };

  exports.repeat = repeat = function(str, n) {
    var res;
    res = '';
    while (n > 0) {
      if (n & 1) {
        res += str;
      }
      n >>>= 1;
      str += str;
    }
    return res;
  };

  exports.compact = function(array) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (item) {
        _results.push(item);
      }
    }
    return _results;
  };

  exports.count = function(string, substr) {
    var num, pos;
    num = pos = 0;
    if (!substr.length) {
      return 1 / 0;
    }
    while (pos = 1 + string.indexOf(substr, pos)) {
      num++;
    }
    return num;
  };

  exports.merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };

  extend = exports.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  exports.flatten = flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(flatten(element));
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };

  exports.del = function(obj, key) {
    var val;
    val = obj[key];
    delete obj[key];
    return val;
  };

  exports.last = last = function(array, back) {
    return array[array.length - (back || 0) - 1];
  };

  exports.some = (_ref = Array.prototype.some) != null ? _ref : function(fn) {
    var e, _i, _len;
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      e = this[_i];
      if (fn(e)) {
        return true;
      }
    }
    return false;
  };

  exports.invertLiterate = function(code) {
    var line, lines, maybe_code;
    maybe_code = true;
    lines = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = code.split('\n');
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        line = _ref1[_i];
        if (maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line)) {
          _results.push(line);
        } else if (maybe_code = /^\s*$/.test(line)) {
          _results.push(line);
        } else {
          _results.push('# ' + line);
        }
      }
      return _results;
    })();
    return lines.join('\n');
  };

  buildLocationData = function(first, last) {
    if (!last) {
      return first;
    } else {
      return {
        first_line: first.first_line,
        first_column: first.first_column,
        last_line: last.last_line,
        last_column: last.last_column
      };
    }
  };

  exports.addLocationDataFn = function(first, last) {
    return function(obj) {
      if (((typeof obj) === 'object') && (!!obj['updateLocationDataIfMissing'])) {
        obj.updateLocationDataIfMissing(buildLocationData(first, last));
      }
      return obj;
    };
  };

  exports.locationDataToString = function(obj) {
    var locationData;
    if (("2" in obj) && ("first_line" in obj[2])) {
      locationData = obj[2];
    } else if ("first_line" in obj) {
      locationData = obj;
    }
    if (locationData) {
      return ((locationData.first_line + 1) + ":" + (locationData.first_column + 1) + "-") + ((locationData.last_line + 1) + ":" + (locationData.last_column + 1));
    } else {
      return "No location data";
    }
  };

  exports.baseFileName = function(file, stripExt, useWinPathSep) {
    var parts, pathSep;
    if (stripExt == null) {
      stripExt = false;
    }
    if (useWinPathSep == null) {
      useWinPathSep = false;
    }
    pathSep = useWinPathSep ? /\\|\// : /\//;
    parts = file.split(pathSep);
    file = parts[parts.length - 1];
    if (!(stripExt && file.indexOf('.') >= 0)) {
      return file;
    }
    parts = file.split('.');
    parts.pop();
    if (parts[parts.length - 1] === 'coffee' && parts.length > 1) {
      parts.pop();
    }
    return parts.join('.');
  };

  exports.isCoffee = function(file) {
    return /\.((lit)?coffee|coffee\.md)$/.test(file);
  };

  exports.isLiterate = function(file) {
    return /\.(litcoffee|coffee\.md)$/.test(file);
  };

  exports.throwSyntaxError = function(message, location) {
    var error;
    error = new SyntaxError(message);
    error.location = location;
    error.toString = syntaxErrorToString;
    error.stack = error.toString();
    throw error;
  };

  exports.updateSyntaxError = function(error, code, filename) {
    if (error.toString === syntaxErrorToString) {
      error.code || (error.code = code);
      error.filename || (error.filename = filename);
      error.stack = error.toString();
    }
    return error;
  };

  syntaxErrorToString = function() {
    var codeLine, colorize, colorsEnabled, end, filename, first_column, first_line, last_column, last_line, marker, start, _ref1, _ref2;
    if (!(this.code && this.location)) {
      return Error.prototype.toString.call(this);
    }
    _ref1 = this.location, first_line = _ref1.first_line, first_column = _ref1.first_column, last_line = _ref1.last_line, last_column = _ref1.last_column;
    if (last_line == null) {
      last_line = first_line;
    }
    if (last_column == null) {
      last_column = first_column;
    }
    filename = this.filename || '[stdin]';
    codeLine = this.code.split('\n')[first_line];
    start = first_column;
    end = first_line === last_line ? last_column + 1 : codeLine.length;
    marker = codeLine.slice(0, start).replace(/[^\s]/g, ' ') + repeat('^', end - start);
    if (typeof process !== "undefined" && process !== null) {
      colorsEnabled = process.stdout.isTTY && !process.env.NODE_DISABLE_COLORS;
    }
    if ((_ref2 = this.colorful) != null ? _ref2 : colorsEnabled) {
      colorize = function(str) {
        return "\x1B[1;31m" + str + "\x1B[0m";
      };
      codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
      marker = colorize(marker);
    }
    return filename + ":" + (first_line + 1) + ":" + (first_column + 1) + ": error: " + this.message + "\n" + codeLine + "\n" + marker;
  };

  exports.nameWhitespaceCharacter = function(string) {
    switch (string) {
      case ' ':
        return 'space';
      case '\n':
        return 'newline';
      case '\r':
        return 'carriage return';
      case '\t':
        return 'tab';
      default:
        return string;
    }
  };

}).call(this);

}).call(this,require("IrXUsu"))
},{"IrXUsu":20}],11:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
(function() {
  var BOM, BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HERECOMMENT_ILLEGAL, HEREDOC_DOUBLE, HEREDOC_INDENT, HEREDOC_SINGLE, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDENTABLE_CLOSERS, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LEADING_BLANK_LINE, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NUMBER, OCTAL_ESCAPE, OPERATOR, POSSIBLY_DIVISION, REGEX, REGEX_FLAGS, REGEX_ILLEGAL, RELATION, RESERVED, Rewriter, SHIFT, STRICT_PROSCRIBED, STRING_DOUBLE, STRING_OMIT, STRING_SINGLE, STRING_START, TRAILING_BLANK_LINE, TRAILING_SPACES, UNARY, UNARY_MATH, VALID_FLAGS, WHITESPACE, compact, count, invertLiterate, key, last, locationDataToString, repeat, starts, throwSyntaxError, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('./rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

  _ref1 = require('./helpers'), count = _ref1.count, starts = _ref1.starts, compact = _ref1.compact, last = _ref1.last, repeat = _ref1.repeat, invertLiterate = _ref1.invertLiterate, locationDataToString = _ref1.locationDataToString, throwSyntaxError = _ref1.throwSyntaxError;

  exports.Lexer = Lexer = (function() {
    function Lexer() {}

    Lexer.prototype.tokenize = function(code, opts) {
      var consumed, end, i, _ref2;
      if (opts == null) {
        opts = {};
      }
      this.literate = opts.literate;
      this.indent = 0;
      this.baseIndent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      this.chunkLine = opts.line || 0;
      this.chunkColumn = opts.column || 0;
      code = this.clean(code);
      i = 0;
      while (this.chunk = code.slice(i)) {
        consumed = this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
        _ref2 = this.getLineAndColumnFromChunk(consumed), this.chunkLine = _ref2[0], this.chunkColumn = _ref2[1];
        i += consumed;
        if (opts.untilBalanced && this.ends.length === 0) {
          return {
            tokens: this.tokens,
            index: i
          };
        }
      }
      this.closeIndentation();
      if (end = this.ends.pop()) {
        throwSyntaxError("missing " + end.tag, end.origin[2]);
      }
      if (opts.rewrite === false) {
        return this.tokens;
      }
      return (new Rewriter).rewrite(this.tokens);
    };

    Lexer.prototype.clean = function(code) {
      if (code.charCodeAt(0) === BOM) {
        code = code.slice(1);
      }
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      if (WHITESPACE.test(code)) {
        code = "\n" + code;
        this.chunkLine--;
      }
      if (this.literate) {
        code = invertLiterate(code);
      }
      return code;
    };

    Lexer.prototype.identifierToken = function() {
      var colon, colonOffset, forcedIdentifier, id, idLength, input, match, poppedToken, prev, tag, tagToken, _ref2, _ref3, _ref4;
      if (!(match = IDENTIFIER.exec(this.chunk))) {
        return 0;
      }
      input = match[0], id = match[1], colon = match[2];
      idLength = id.length;
      poppedToken = void 0;
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      if (id === 'from' && this.tag() === 'YIELD') {
        this.token('FROM', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref2 = prev[0]) === '.' || _ref2 === '?.' || _ref2 === '::' || _ref2 === '?::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref3 = this.tag(), __indexOf.call(LINE_BREAK, _ref3) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              poppedToken = this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("reserved word \"" + id + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) {
          id = COFFEE_ALIAS_MAP[id];
        }
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
              return 'BOOL';
            case 'break':
            case 'continue':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      tagToken = this.token(tag, id, 0, idLength);
      tagToken.variable = !forcedIdentifier;
      if (poppedToken) {
        _ref4 = [poppedToken[2].first_line, poppedToken[2].first_column], tagToken[2].first_line = _ref4[0], tagToken[2].first_column = _ref4[1];
      }
      if (colon) {
        colonOffset = input.lastIndexOf(':');
        this.token(':', ':', colonOffset, colon.length);
      }
      return input.length;
    };

    Lexer.prototype.numberToken = function() {
      var binaryLiteral, lexedLength, match, number, octalLiteral;
      if (!(match = NUMBER.exec(this.chunk))) {
        return 0;
      }
      number = match[0];
      if (/^0[BOX]/.test(number)) {
        this.error("radix prefix '" + number + "' must be lowercase");
      } else if (/E/.test(number) && !/^0x/.test(number)) {
        this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
      } else if (/^0\d*[89]/.test(number)) {
        this.error("decimal literal '" + number + "' must not be prefixed with '0'");
      } else if (/^0\d+/.test(number)) {
        this.error("octal literal '" + number + "' must be prefixed with '0o'");
      }
      lexedLength = number.length;
      if (octalLiteral = /^0o([0-7]+)/.exec(number)) {
        number = '0x' + parseInt(octalLiteral[1], 8).toString(16);
      }
      if (binaryLiteral = /^0b([01]+)/.exec(number)) {
        number = '0x' + parseInt(binaryLiteral[1], 2).toString(16);
      }
      this.token('NUMBER', number, 0, lexedLength);
      return lexedLength;
    };

    Lexer.prototype.stringToken = function() {
      var $, attempt, doc, end, heredoc, i, indent, indentRegex, match, quote, regex, start, token, tokens, _ref2, _ref3;
      quote = (STRING_START.exec(this.chunk) || [])[0];
      if (!quote) {
        return 0;
      }
      regex = (function() {
        switch (quote) {
          case "'":
            return STRING_SINGLE;
          case '"':
            return STRING_DOUBLE;
          case "'''":
            return HEREDOC_SINGLE;
          case '"""':
            return HEREDOC_DOUBLE;
        }
      })();
      heredoc = quote.length === 3;
      start = quote.length;
      _ref2 = this.matchWithInterpolations(this.chunk.slice(start), regex, quote, start), tokens = _ref2.tokens, end = _ref2.index;
      $ = tokens.length - 1;
      if (heredoc) {
        indent = null;
        doc = ((function() {
          var _i, _len, _results;
          _results = [];
          for (i = _i = 0, _len = tokens.length; _i < _len; i = ++_i) {
            token = tokens[i];
            if (token[0] === 'NEOSTRING') {
              _results.push(token[1]);
            }
          }
          return _results;
        })()).join('#{}');
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref3 = attempt.length) && _ref3 < indent.length)) {
            indent = attempt;
          }
        }
        if (indent) {
          indentRegex = RegExp("^" + indent, "gm");
        }
        this.mergeInterpolationTokens(tokens, {
          quote: quote[0],
          start: start,
          end: end
        }, (function(_this) {
          return function(value, i) {
            value = _this.formatString(value);
            if (i === 0) {
              value = value.replace(LEADING_BLANK_LINE, '');
            }
            if (i === $) {
              value = value.replace(TRAILING_BLANK_LINE, '');
            }
            value = value.replace(indentRegex, '');
            value = value.replace(MULTILINER, '\\n');
            return value;
          };
        })(this));
      } else {
        this.mergeInterpolationTokens(tokens, {
          quote: quote,
          start: start,
          end: end
        }, (function(_this) {
          return function(value, i) {
            value = _this.formatString(value);
            value = value.replace(STRING_OMIT, function(match, offset) {
              if ((i === 0 && offset === 0) || (i === $ && offset + match.length === value.length)) {
                return '';
              } else {
                return ' ';
              }
            });
            return value;
          };
        })(this));
      }
      return end;
    };

    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) {
        return 0;
      }
      comment = match[0], here = match[1];
      if (here) {
        if (match = HERECOMMENT_ILLEGAL.exec(comment)) {
          this.error("block comments cannot contain " + match[0], match.index);
        }
        if (here.indexOf('\n') >= 0) {
          here = here.replace(RegExp("\\n" + (repeat(' ', this.indent)), "g"), '\n');
        }
        this.token('HERECOMMENT', here, 0, comment.length);
      }
      return comment.length;
    };

    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1), 0, script.length);
      return script.length;
    };

    Lexer.prototype.regexToken = function() {
      var closed, end, flags, index, match, prev, re, regex, rparen, tokens, _ref2, _ref3, _ref4;
      switch (false) {
        case !(match = REGEX_ILLEGAL.exec(this.chunk)):
          this.error("regular expressions cannot begin with " + match[2], match.index + match[1].length);
          break;
        case this.chunk.slice(0, 3) !== '///':
          _ref2 = this.matchWithInterpolations(this.chunk.slice(3), HEREGEX, '///', 3), tokens = _ref2.tokens, index = _ref2.index;
          break;
        case !(match = REGEX.exec(this.chunk)):
          regex = match[0], closed = match[1];
          index = regex.length;
          prev = last(this.tokens);
          if (prev) {
            if (prev.spaced && (_ref3 = prev[0], __indexOf.call(CALLABLE, _ref3) >= 0) && !prev.stringEnd && !prev.regexEnd) {
              if (!closed || POSSIBLY_DIVISION.test(regex)) {
                return 0;
              }
            } else if (_ref4 = prev[0], __indexOf.call(NOT_REGEX, _ref4) >= 0) {
              return 0;
            }
          }
          if (!closed) {
            this.error('missing / (unclosed regex)');
          }
          break;
        default:
          return 0;
      }
      flags = REGEX_FLAGS.exec(this.chunk.slice(index))[0];
      end = index + flags.length;
      switch (false) {
        case !!VALID_FLAGS.test(flags):
          this.error("invalid regular expression flags " + flags, index);
          break;
        case !regex:
          this.token('REGEX', "" + regex + flags);
          break;
        case tokens.length !== 1:
          re = this.formatHeregex(tokens[0][1]).replace(/\//g, '\\/');
          this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
          break;
        default:
          this.token('IDENTIFIER', 'RegExp', 0, 0);
          this.token('CALL_START', '(', 0, 0);
          this.mergeInterpolationTokens(tokens, {
            quote: '"',
            start: 3,
            end: end
          }, (function(_this) {
            return function(value) {
              return _this.formatHeregex(value).replace(/\\/g, '\\\\');
            };
          })(this));
          if (flags) {
            this.token(',', ',', index, 0);
            this.token('STRING', '"' + flags + '"', index, flags.length);
          }
          rparen = this.token(')', ')', end, 0);
          rparen.regexEnd = true;
      }
      return end;
    };

    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) {
        return 0;
      }
      indent = match[0];
      this.seenFor = false;
      size = indent.length - 1 - indent.lastIndexOf('\n');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken(0);
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        if (!this.tokens.length) {
          this.baseIndent = this.indent = size;
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.token('INDENT', diff, indent.length - size, size);
        this.indents.push(diff);
        this.ends.push({
          tag: 'OUTDENT'
        });
        this.outdebt = this.indebt = 0;
        this.indent = size;
      } else if (size < this.baseIndent) {
        this.error('missing indentation', indent.length);
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines, indent.length);
      }
      return indent.length;
    };

    Lexer.prototype.outdentToken = function(moveOut, noNewlines, outdentLength) {
      var decreasedIndent, dent, lastIndent, _ref2;
      decreasedIndent = this.indent - moveOut;
      while (moveOut > 0) {
        lastIndent = this.indents[this.indents.length - 1];
        if (!lastIndent) {
          moveOut = 0;
        } else if (lastIndent === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (lastIndent < this.outdebt) {
          this.outdebt -= lastIndent;
          moveOut -= lastIndent;
        } else {
          dent = this.indents.pop() + this.outdebt;
          if (outdentLength && (_ref2 = this.chunk[outdentLength], __indexOf.call(INDENTABLE_CLOSERS, _ref2) >= 0)) {
            decreasedIndent -= dent - moveOut;
            moveOut = dent;
          }
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', moveOut, 0, outdentLength);
          moveOut -= dent;
        }
      }
      if (dent) {
        this.outdebt -= moveOut;
      }
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', '\n', outdentLength, 0);
      }
      this.indent = decreasedIndent;
      return this;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) {
        prev[match ? 'spaced' : 'newLine'] = true;
      }
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };

    Lexer.prototype.newlineToken = function(offset) {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') {
        this.token('TERMINATOR', '\n', offset, 0);
      }
      return this;
    };

    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') {
        this.tokens.pop();
      }
      return this;
    };

    Lexer.prototype.literalToken = function() {
      var match, prev, tag, token, value, _ref2, _ref3, _ref4, _ref5;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) {
          this.tagParameters();
        }
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref2 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref2) >= 0)) {
          this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref3 = prev[1]) === '||' || _ref3 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        this.seenFor = false;
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(UNARY_MATH, value) >= 0) {
        tag = 'UNARY_MATH';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref4 = prev[0], __indexOf.call(CALLABLE, _ref4) >= 0) && !prev.stringEnd && !prev.regexEnd) {
          if (prev[0] === '?') {
            prev[0] = 'FUNC_EXIST';
          }
          tag = 'CALL_START';
        } else if (value === '[' && (_ref5 = prev[0], __indexOf.call(INDEXABLE, _ref5) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      token = this.makeToken(tag, value);
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push({
            tag: INVERSES[value],
            origin: token
          });
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.tokens.push(token);
      return value.length;
    };

    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') {
        return this;
      }
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };

    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };

    Lexer.prototype.matchWithInterpolations = function(str, regex, end, offsetInChunk) {
      var close, column, index, line, nested, open, strPart, tokens, _ref2, _ref3, _ref4;
      tokens = [];
      while (true) {
        strPart = regex.exec(str)[0];
        tokens.push(this.makeToken('NEOSTRING', strPart, offsetInChunk));
        str = str.slice(strPart.length);
        offsetInChunk += strPart.length;
        if (str.slice(0, 2) !== '#{') {
          break;
        }
        _ref2 = this.getLineAndColumnFromChunk(offsetInChunk + 1), line = _ref2[0], column = _ref2[1];
        _ref3 = new Lexer().tokenize(str.slice(1), {
          line: line,
          column: column,
          untilBalanced: true
        }), nested = _ref3.tokens, index = _ref3.index;
        index += 1;
        open = nested[0], close = nested[nested.length - 1];
        open[0] = open[1] = '(';
        close[0] = close[1] = ')';
        close.origin = ['', 'end of interpolation', close[2]];
        if (((_ref4 = nested[1]) != null ? _ref4[0] : void 0) === 'TERMINATOR') {
          nested.splice(1, 1);
        }
        tokens.push(['TOKENS', nested]);
        str = str.slice(index);
        offsetInChunk += index;
      }
      if (str.slice(0, end.length) !== end) {
        this.error("missing " + end);
      }
      return {
        tokens: tokens,
        index: offsetInChunk + end.length
      };
    };

    Lexer.prototype.mergeInterpolationTokens = function(tokens, _arg, fn) {
      var converted, end, errorToken, firstEmptyStringIndex, firstIndex, i, interpolated, locationToken, plusToken, quote, rparen, start, tag, token, tokensToPush, value, _i, _len, _ref2;
      quote = _arg.quote, start = _arg.start, end = _arg.end;
      if (interpolated = tokens.length > 1) {
        errorToken = this.makeToken('', 'interpolation', start + tokens[0][1].length, 2);
        this.token('(', '(', 0, 0, errorToken);
      }
      firstIndex = this.tokens.length;
      for (i = _i = 0, _len = tokens.length; _i < _len; i = ++_i) {
        token = tokens[i];
        tag = token[0], value = token[1];
        switch (tag) {
          case 'TOKENS':
            if (value.length === 2) {
              continue;
            }
            locationToken = value[0];
            tokensToPush = value;
            break;
          case 'NEOSTRING':
            converted = fn(token[1], i);
            if (converted.length === 0) {
              if (i === 0) {
                firstEmptyStringIndex = this.tokens.length;
              } else {
                continue;
              }
            }
            if (i === 2 && (firstEmptyStringIndex != null)) {
              this.tokens.splice(firstEmptyStringIndex, 2);
            }
            token[0] = 'STRING';
            token[1] = this.makeString(converted, quote);
            locationToken = token;
            tokensToPush = [token];
        }
        if (this.tokens.length > firstIndex) {
          plusToken = this.token('+', '+');
          plusToken[2] = {
            first_line: locationToken[2].first_line,
            first_column: locationToken[2].first_column,
            last_line: locationToken[2].first_line,
            last_column: locationToken[2].first_column
          };
        }
        (_ref2 = this.tokens).push.apply(_ref2, tokensToPush);
      }
      if (interpolated) {
        rparen = this.token(')', ')', end, 0);
        return rparen.stringEnd = true;
      }
    };

    Lexer.prototype.pair = function(tag) {
      var wanted, _ref2;
      if (tag !== (wanted = (_ref2 = last(this.ends)) != null ? _ref2.tag : void 0)) {
        if ('OUTDENT' !== wanted) {
          this.error("unmatched " + tag);
        }
        this.outdentToken(last(this.indents), true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };

    Lexer.prototype.getLineAndColumnFromChunk = function(offset) {
      var column, lineCount, lines, string;
      if (offset === 0) {
        return [this.chunkLine, this.chunkColumn];
      }
      if (offset >= this.chunk.length) {
        string = this.chunk;
      } else {
        string = this.chunk.slice(0, +(offset - 1) + 1 || 9e9);
      }
      lineCount = count(string, '\n');
      column = this.chunkColumn;
      if (lineCount > 0) {
        lines = string.split('\n');
        column = last(lines).length;
      } else {
        column += string.length;
      }
      return [this.chunkLine + lineCount, column];
    };

    Lexer.prototype.makeToken = function(tag, value, offsetInChunk, length) {
      var lastCharacter, locationData, token, _ref2, _ref3;
      if (offsetInChunk == null) {
        offsetInChunk = 0;
      }
      if (length == null) {
        length = value.length;
      }
      locationData = {};
      _ref2 = this.getLineAndColumnFromChunk(offsetInChunk), locationData.first_line = _ref2[0], locationData.first_column = _ref2[1];
      lastCharacter = Math.max(0, length - 1);
      _ref3 = this.getLineAndColumnFromChunk(offsetInChunk + lastCharacter), locationData.last_line = _ref3[0], locationData.last_column = _ref3[1];
      token = [tag, value, locationData];
      return token;
    };

    Lexer.prototype.token = function(tag, value, offsetInChunk, length, origin) {
      var token;
      token = this.makeToken(tag, value, offsetInChunk, length);
      if (origin) {
        token.origin = origin;
      }
      this.tokens.push(token);
      return token;
    };

    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };

    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };

    Lexer.prototype.unfinished = function() {
      var _ref2;
      return LINE_CONTINUER.test(this.chunk) || ((_ref2 = this.tag()) === '\\' || _ref2 === '.' || _ref2 === '?.' || _ref2 === '?::' || _ref2 === 'UNARY' || _ref2 === 'MATH' || _ref2 === 'UNARY_MATH' || _ref2 === '+' || _ref2 === '-' || _ref2 === 'YIELD' || _ref2 === '**' || _ref2 === 'SHIFT' || _ref2 === 'RELATION' || _ref2 === 'COMPARE' || _ref2 === 'LOGIC' || _ref2 === 'THROW' || _ref2 === 'EXTENDS');
    };

    Lexer.prototype.formatString = function(str) {
      return str.replace(/\\[^\S\n]*(\n|\\)\s*/g, function(escaped, character) {
        if (character === '\n') {
          return '';
        } else {
          return escaped;
        }
      });
    };

    Lexer.prototype.formatHeregex = function(str) {
      return str.replace(HEREGEX_OMIT, '$1$2').replace(MULTILINER, '\\n');
    };

    Lexer.prototype.makeString = function(body, quote) {
      var match;
      if (!body) {
        return quote + quote;
      }
      body = body.replace(RegExp("\\\\(" + quote + "|\\\\)", "g"), function(match, contents) {
        if (contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      if (match = OCTAL_ESCAPE.exec(body)) {
        this.error("octal escape sequences are not allowed " + match[2], match.index + match[1].length + 1);
      }
      return quote + body + quote;
    };

    Lexer.prototype.error = function(message, offset) {
      var first_column, first_line, _ref2;
      if (offset == null) {
        offset = 0;
      }
      _ref2 = this.getLineAndColumnFromChunk(offset), first_line = _ref2[0], first_column = _ref2[1];
      return throwSyntaxError(message, {
        first_line: first_line,
        first_column: first_column
      });
    };

    return Lexer;

  })();

  JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'yield', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];

  COFFEE_KEYWORDS = ['undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };

  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();

  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

  RESERVED = ['case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'export', 'import', 'native', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static'];

  STRICT_PROSCRIBED = ['arguments', 'eval', 'yield*'];

  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);

  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;

  BOM = 65279;

  IDENTIFIER = /^(?!\d)((?:(?!\s)[$\w\x7f-\uffff])+)([^\n\S]*:(?!:))?/;

  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>*\/%])\2=?|\?(\.|::)|\.{2,3})/;

  WHITESPACE = /^[^\n\S]+/;

  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/;

  CODE = /^[-=]>/;

  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

  STRING_START = /^(?:'''|"""|'|")/;

  STRING_SINGLE = /^(?:[^\\']|\\[\s\S])*/;

  STRING_DOUBLE = /^(?:[^\\"#]|\\[\s\S]|\#(?!\{))*/;

  HEREDOC_SINGLE = /^(?:[^\\']|\\[\s\S]|'(?!''))*/;

  HEREDOC_DOUBLE = /^(?:[^\\"#]|\\[\s\S]|"(?!"")|\#(?!\{))*/;

  STRING_OMIT = /\s*\n\s*/g;

  HEREDOC_INDENT = /\n+([^\n\S]*)(?=\S)/g;

  REGEX = /^\/(?!\/)(?:[^[\/\n\\]|\\.|\[(?:\\.|[^\]\n\\])*])*(\/)?/;

  REGEX_FLAGS = /^\w*/;

  VALID_FLAGS = /^(?!.*(.).*\1)[imgy]*$/;

  HEREGEX = /^(?:[^\\\/#]|\\[\s\S]|\/(?!\/\/)|\#(?!\{))*/;

  HEREGEX_OMIT = /((?:\\\\)+)|\\(\s|\/)|\s+(?:#.*)?/g;

  REGEX_ILLEGAL = /^(\/|\/{3}\s*)(\*)/;

  POSSIBLY_DIVISION = /^\/=?\s/;

  MULTILINER = /\n/g;

  HERECOMMENT_ILLEGAL = /\*\//;

  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

  OCTAL_ESCAPE = /^((?:\\.|[^\\])*)(\\(?:0[0-7]|[1-7]))/;

  LEADING_BLANK_LINE = /^[^\n\S]*\n/;

  TRAILING_BLANK_LINE = /\n[^\n\S]*$/;

  TRAILING_SPACES = /\s+$/;

  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '**=', '//=', '%%='];

  UNARY = ['NEW', 'TYPEOF', 'DELETE', 'DO'];

  UNARY_MATH = ['!', '~'];

  LOGIC = ['&&', '||', '&', '|', '^'];

  SHIFT = ['<<', '>>', '>>>'];

  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

  MATH = ['*', '/', '%', '//', '%%'];

  RELATION = ['IN', 'OF', 'INSTANCEOF'];

  BOOL = ['TRUE', 'FALSE'];

  CALLABLE = ['IDENTIFIER', ')', ']', '?', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat(['NUMBER', 'STRING', 'REGEX', 'BOOL', 'NULL', 'UNDEFINED', '}', '::']);

  NOT_REGEX = INDEXABLE.concat(['++', '--']);

  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

  INDENTABLE_CLOSERS = [')', '}', ']'];

}).call(this);

},{"./helpers":10,"./rewriter":15}],12:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
(function() {
  var Access, Arr, Assign, Base, Block, Call, Class, Code, CodeFragment, Comment, Existence, Expansion, Extends, For, HEXNUM, IDENTIFIER, IDENTIFIER_STR, IS_REGEX, IS_STRING, If, In, Index, LEVEL_ACCESS, LEVEL_COND, LEVEL_LIST, LEVEL_OP, LEVEL_PAREN, LEVEL_TOP, Literal, METHOD_DEF, NEGATE, NO, NUMBER, Obj, Op, Param, Parens, RESERVED, Range, Return, SIMPLENUM, STRICT_PROSCRIBED, Scope, Slice, Splat, Switch, TAB, THIS, Throw, Try, UTILITIES, Value, While, YES, addLocationDataFn, compact, del, ends, extend, flatten, fragmentsToText, isLiteralArguments, isLiteralThis, last, locationDataToString, merge, multident, parseNum, some, starts, throwSyntaxError, unfoldSoak, utility, _ref, _ref1,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  Error.stackTraceLimit = Infinity;

  Scope = require('./scope').Scope;

  _ref = require('./lexer'), RESERVED = _ref.RESERVED, STRICT_PROSCRIBED = _ref.STRICT_PROSCRIBED;

  _ref1 = require('./helpers'), compact = _ref1.compact, flatten = _ref1.flatten, extend = _ref1.extend, merge = _ref1.merge, del = _ref1.del, starts = _ref1.starts, ends = _ref1.ends, last = _ref1.last, some = _ref1.some, addLocationDataFn = _ref1.addLocationDataFn, locationDataToString = _ref1.locationDataToString, throwSyntaxError = _ref1.throwSyntaxError;

  exports.extend = extend;

  exports.addLocationDataFn = addLocationDataFn;

  YES = function() {
    return true;
  };

  NO = function() {
    return false;
  };

  THIS = function() {
    return this;
  };

  NEGATE = function() {
    this.negated = !this.negated;
    return this;
  };

  exports.CodeFragment = CodeFragment = (function() {
    function CodeFragment(parent, code) {
      var _ref2;
      this.code = "" + code;
      this.locationData = parent != null ? parent.locationData : void 0;
      this.type = (parent != null ? (_ref2 = parent.constructor) != null ? _ref2.name : void 0 : void 0) || 'unknown';
    }

    CodeFragment.prototype.toString = function() {
      return "" + this.code + (this.locationData ? ": " + locationDataToString(this.locationData) : '');
    };

    return CodeFragment;

  })();

  fragmentsToText = function(fragments) {
    var fragment;
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fragments.length; _i < _len; _i++) {
        fragment = fragments[_i];
        _results.push(fragment.code);
      }
      return _results;
    })()).join('');
  };

  exports.Base = Base = (function() {
    function Base() {}

    Base.prototype.compile = function(o, lvl) {
      return fragmentsToText(this.compileToFragments(o, lvl));
    };

    Base.prototype.compileToFragments = function(o, lvl) {
      var node;
      o = extend({}, o);
      if (lvl) {
        o.level = lvl;
      }
      node = this.unfoldSoak(o) || this;
      node.tab = o.indent;
      if (o.level === LEVEL_TOP || !node.isStatement(o)) {
        return node.compileNode(o);
      } else {
        return node.compileClosure(o);
      }
    };

    Base.prototype.compileClosure = function(o) {
      var args, argumentsNode, func, jumpNode, meth, parts;
      if (jumpNode = this.jumps()) {
        jumpNode.error('cannot use a pure statement in an expression');
      }
      o.sharedScope = true;
      func = new Code([], Block.wrap([this]));
      args = [];
      if ((argumentsNode = this.contains(isLiteralArguments)) || this.contains(isLiteralThis)) {
        args = [new Literal('this')];
        if (argumentsNode) {
          meth = 'apply';
          args.push(new Literal('arguments'));
        } else {
          meth = 'call';
        }
        func = new Value(func, [new Access(new Literal(meth))]);
      }
      parts = (new Call(func, args)).compileNode(o);
      if (func.isGenerator) {
        parts.unshift(this.makeCode("(yield* "));
        parts.push(this.makeCode(")"));
      }
      return parts;
    };

    Base.prototype.cache = function(o, level, reused) {
      var ref, sub;
      if (!this.isComplex()) {
        ref = level ? this.compileToFragments(o, level) : this;
        return [ref, ref];
      } else {
        ref = new Literal(reused || o.scope.freeVariable('ref'));
        sub = new Assign(ref, this);
        if (level) {
          return [sub.compileToFragments(o, level), [this.makeCode(ref.value)]];
        } else {
          return [sub, ref];
        }
      }
    };

    Base.prototype.cacheToCodeFragments = function(cacheValues) {
      return [fragmentsToText(cacheValues[0]), fragmentsToText(cacheValues[1])];
    };

    Base.prototype.makeReturn = function(res) {
      var me;
      me = this.unwrapAll();
      if (res) {
        return new Call(new Literal(res + ".push"), [me]);
      } else {
        return new Return(me);
      }
    };

    Base.prototype.contains = function(pred) {
      var node;
      node = void 0;
      this.traverseChildren(false, function(n) {
        if (pred(n)) {
          node = n;
          return false;
        }
      });
      return node;
    };

    Base.prototype.lastNonComment = function(list) {
      var i;
      i = list.length;
      while (i--) {
        if (!(list[i] instanceof Comment)) {
          return list[i];
        }
      }
      return null;
    };

    Base.prototype.toString = function(idt, name) {
      var tree;
      if (idt == null) {
        idt = '';
      }
      if (name == null) {
        name = this.constructor.name;
      }
      tree = '\n' + idt + name;
      if (this.soak) {
        tree += '?';
      }
      this.eachChild(function(node) {
        return tree += node.toString(idt + TAB);
      });
      return tree;
    };

    Base.prototype.eachChild = function(func) {
      var attr, child, _i, _j, _len, _len1, _ref2, _ref3;
      if (!this.children) {
        return this;
      }
      _ref2 = this.children;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        attr = _ref2[_i];
        if (this[attr]) {
          _ref3 = flatten([this[attr]]);
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            child = _ref3[_j];
            if (func(child) === false) {
              return this;
            }
          }
        }
      }
      return this;
    };

    Base.prototype.traverseChildren = function(crossScope, func) {
      return this.eachChild(function(child) {
        var recur;
        recur = func(child);
        if (recur !== false) {
          return child.traverseChildren(crossScope, func);
        }
      });
    };

    Base.prototype.invert = function() {
      return new Op('!', this);
    };

    Base.prototype.unwrapAll = function() {
      var node;
      node = this;
      while (node !== (node = node.unwrap())) {
        continue;
      }
      return node;
    };

    Base.prototype.children = [];

    Base.prototype.isStatement = NO;

    Base.prototype.jumps = NO;

    Base.prototype.isComplex = YES;

    Base.prototype.isChainable = NO;

    Base.prototype.isAssignable = NO;

    Base.prototype.unwrap = THIS;

    Base.prototype.unfoldSoak = NO;

    Base.prototype.assigns = NO;

    Base.prototype.updateLocationDataIfMissing = function(locationData) {
      if (this.locationData) {
        return this;
      }
      this.locationData = locationData;
      return this.eachChild(function(child) {
        return child.updateLocationDataIfMissing(locationData);
      });
    };

    Base.prototype.error = function(message) {
      return throwSyntaxError(message, this.locationData);
    };

    Base.prototype.makeCode = function(code) {
      return new CodeFragment(this, code);
    };

    Base.prototype.wrapInBraces = function(fragments) {
      return [].concat(this.makeCode('('), fragments, this.makeCode(')'));
    };

    Base.prototype.joinFragmentArrays = function(fragmentsList, joinStr) {
      var answer, fragments, i, _i, _len;
      answer = [];
      for (i = _i = 0, _len = fragmentsList.length; _i < _len; i = ++_i) {
        fragments = fragmentsList[i];
        if (i) {
          answer.push(this.makeCode(joinStr));
        }
        answer = answer.concat(fragments);
      }
      return answer;
    };

    return Base;

  })();

  exports.Block = Block = (function(_super) {
    __extends(Block, _super);

    function Block(nodes) {
      this.expressions = compact(flatten(nodes || []));
    }

    Block.prototype.children = ['expressions'];

    Block.prototype.push = function(node) {
      this.expressions.push(node);
      return this;
    };

    Block.prototype.pop = function() {
      return this.expressions.pop();
    };

    Block.prototype.unshift = function(node) {
      this.expressions.unshift(node);
      return this;
    };

    Block.prototype.unwrap = function() {
      if (this.expressions.length === 1) {
        return this.expressions[0];
      } else {
        return this;
      }
    };

    Block.prototype.isEmpty = function() {
      return !this.expressions.length;
    };

    Block.prototype.isStatement = function(o) {
      var exp, _i, _len, _ref2;
      _ref2 = this.expressions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        exp = _ref2[_i];
        if (exp.isStatement(o)) {
          return true;
        }
      }
      return false;
    };

    Block.prototype.jumps = function(o) {
      var exp, jumpNode, _i, _len, _ref2;
      _ref2 = this.expressions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        exp = _ref2[_i];
        if (jumpNode = exp.jumps(o)) {
          return jumpNode;
        }
      }
    };

    Block.prototype.makeReturn = function(res) {
      var expr, len;
      len = this.expressions.length;
      while (len--) {
        expr = this.expressions[len];
        if (!(expr instanceof Comment)) {
          this.expressions[len] = expr.makeReturn(res);
          if (expr instanceof Return && !expr.expression) {
            this.expressions.splice(len, 1);
          }
          break;
        }
      }
      return this;
    };

    Block.prototype.compileToFragments = function(o, level) {
      if (o == null) {
        o = {};
      }
      if (o.scope) {
        return Block.__super__.compileToFragments.call(this, o, level);
      } else {
        return this.compileRoot(o);
      }
    };

    Block.prototype.compileNode = function(o) {
      var answer, compiledNodes, fragments, index, node, top, _i, _len, _ref2;
      this.tab = o.indent;
      top = o.level === LEVEL_TOP;
      compiledNodes = [];
      _ref2 = this.expressions;
      for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
        node = _ref2[index];
        node = node.unwrapAll();
        node = node.unfoldSoak(o) || node;
        if (node instanceof Block) {
          compiledNodes.push(node.compileNode(o));
        } else if (top) {
          node.front = true;
          fragments = node.compileToFragments(o);
          if (!node.isStatement(o)) {
            fragments.unshift(this.makeCode("" + this.tab));
            fragments.push(this.makeCode(";"));
          }
          compiledNodes.push(fragments);
        } else {
          compiledNodes.push(node.compileToFragments(o, LEVEL_LIST));
        }
      }
      if (top) {
        if (this.spaced) {
          return [].concat(this.joinFragmentArrays(compiledNodes, '\n\n'), this.makeCode("\n"));
        } else {
          return this.joinFragmentArrays(compiledNodes, '\n');
        }
      }
      if (compiledNodes.length) {
        answer = this.joinFragmentArrays(compiledNodes, ', ');
      } else {
        answer = [this.makeCode("void 0")];
      }
      if (compiledNodes.length > 1 && o.level >= LEVEL_LIST) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    Block.prototype.compileRoot = function(o) {
      var exp, fragments, i, name, prelude, preludeExps, rest, _i, _len, _ref2, _ref3;
      o.indent = o.bare ? '' : TAB;
      o.level = LEVEL_TOP;
      this.spaced = true;
      o.scope = new Scope(null, this, null, (_ref2 = o.referencedVars) != null ? _ref2 : []);
      _ref3 = o.locals || [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        name = _ref3[_i];
        o.scope.parameter(name);
      }
      prelude = [];
      if (!o.bare) {
        preludeExps = (function() {
          var _j, _len1, _ref4, _results;
          _ref4 = this.expressions;
          _results = [];
          for (i = _j = 0, _len1 = _ref4.length; _j < _len1; i = ++_j) {
            exp = _ref4[i];
            if (!(exp.unwrap() instanceof Comment)) {
              break;
            }
            _results.push(exp);
          }
          return _results;
        }).call(this);
        rest = this.expressions.slice(preludeExps.length);
        this.expressions = preludeExps;
        if (preludeExps.length) {
          prelude = this.compileNode(merge(o, {
            indent: ''
          }));
          prelude.push(this.makeCode("\n"));
        }
        this.expressions = rest;
      }
      fragments = this.compileWithDeclarations(o);
      if (o.bare) {
        return fragments;
      }
      return [].concat(prelude, this.makeCode("(function() {\n"), fragments, this.makeCode("\n}).call(this);\n"));
    };

    Block.prototype.compileWithDeclarations = function(o) {
      var assigns, declars, exp, fragments, i, post, rest, scope, spaced, _i, _len, _ref2, _ref3, _ref4;
      fragments = [];
      post = [];
      _ref2 = this.expressions;
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        exp = _ref2[i];
        exp = exp.unwrap();
        if (!(exp instanceof Comment || exp instanceof Literal)) {
          break;
        }
      }
      o = merge(o, {
        level: LEVEL_TOP
      });
      if (i) {
        rest = this.expressions.splice(i, 9e9);
        _ref3 = [this.spaced, false], spaced = _ref3[0], this.spaced = _ref3[1];
        _ref4 = [this.compileNode(o), spaced], fragments = _ref4[0], this.spaced = _ref4[1];
        this.expressions = rest;
      }
      post = this.compileNode(o);
      scope = o.scope;
      if (scope.expressions === this) {
        declars = o.scope.hasDeclarations();
        assigns = scope.hasAssignments;
        if (declars || assigns) {
          if (i) {
            fragments.push(this.makeCode('\n'));
          }
          fragments.push(this.makeCode(this.tab + "var "));
          if (declars) {
            fragments.push(this.makeCode(scope.declaredVariables().join(', ')));
          }
          if (assigns) {
            if (declars) {
              fragments.push(this.makeCode(",\n" + (this.tab + TAB)));
            }
            fragments.push(this.makeCode(scope.assignedVariables().join(",\n" + (this.tab + TAB))));
          }
          fragments.push(this.makeCode(";\n" + (this.spaced ? '\n' : '')));
        } else if (fragments.length && post.length) {
          fragments.push(this.makeCode("\n"));
        }
      }
      return fragments.concat(post);
    };

    Block.wrap = function(nodes) {
      if (nodes.length === 1 && nodes[0] instanceof Block) {
        return nodes[0];
      }
      return new Block(nodes);
    };

    return Block;

  })(Base);

  exports.Literal = Literal = (function(_super) {
    __extends(Literal, _super);

    function Literal(_at_value) {
      this.value = _at_value;
    }

    Literal.prototype.makeReturn = function() {
      if (this.isStatement()) {
        return this;
      } else {
        return Literal.__super__.makeReturn.apply(this, arguments);
      }
    };

    Literal.prototype.isAssignable = function() {
      return IDENTIFIER.test(this.value);
    };

    Literal.prototype.isStatement = function() {
      var _ref2;
      return (_ref2 = this.value) === 'break' || _ref2 === 'continue' || _ref2 === 'debugger';
    };

    Literal.prototype.isComplex = NO;

    Literal.prototype.assigns = function(name) {
      return name === this.value;
    };

    Literal.prototype.jumps = function(o) {
      if (this.value === 'break' && !((o != null ? o.loop : void 0) || (o != null ? o.block : void 0))) {
        return this;
      }
      if (this.value === 'continue' && !(o != null ? o.loop : void 0)) {
        return this;
      }
    };

    Literal.prototype.compileNode = function(o) {
      var answer, code, _ref2;
      code = this.value === 'this' ? ((_ref2 = o.scope.method) != null ? _ref2.bound : void 0) ? o.scope.method.context : this.value : this.value.reserved ? "\"" + this.value + "\"" : this.value;
      answer = this.isStatement() ? "" + this.tab + code + ";" : code;
      return [this.makeCode(answer)];
    };

    Literal.prototype.toString = function() {
      return ' "' + this.value + '"';
    };

    return Literal;

  })(Base);

  exports.Undefined = (function(_super) {
    __extends(Undefined, _super);

    function Undefined() {
      return Undefined.__super__.constructor.apply(this, arguments);
    }

    Undefined.prototype.isAssignable = NO;

    Undefined.prototype.isComplex = NO;

    Undefined.prototype.compileNode = function(o) {
      return [this.makeCode(o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0')];
    };

    return Undefined;

  })(Base);

  exports.Null = (function(_super) {
    __extends(Null, _super);

    function Null() {
      return Null.__super__.constructor.apply(this, arguments);
    }

    Null.prototype.isAssignable = NO;

    Null.prototype.isComplex = NO;

    Null.prototype.compileNode = function() {
      return [this.makeCode("null")];
    };

    return Null;

  })(Base);

  exports.Bool = (function(_super) {
    __extends(Bool, _super);

    Bool.prototype.isAssignable = NO;

    Bool.prototype.isComplex = NO;

    Bool.prototype.compileNode = function() {
      return [this.makeCode(this.val)];
    };

    function Bool(_at_val) {
      this.val = _at_val;
    }

    return Bool;

  })(Base);

  exports.Return = Return = (function(_super) {
    __extends(Return, _super);

    function Return(_at_expression) {
      this.expression = _at_expression;
    }

    Return.prototype.children = ['expression'];

    Return.prototype.isStatement = YES;

    Return.prototype.makeReturn = THIS;

    Return.prototype.jumps = THIS;

    Return.prototype.compileToFragments = function(o, level) {
      var expr, _ref2;
      expr = (_ref2 = this.expression) != null ? _ref2.makeReturn() : void 0;
      if (expr && !(expr instanceof Return)) {
        return expr.compileToFragments(o, level);
      } else {
        return Return.__super__.compileToFragments.call(this, o, level);
      }
    };

    Return.prototype.compileNode = function(o) {
      var answer;
      answer = [];
      answer.push(this.makeCode(this.tab + ("return" + (this.expression ? " " : ""))));
      if (this.expression) {
        answer = answer.concat(this.expression.compileToFragments(o, LEVEL_PAREN));
      }
      answer.push(this.makeCode(";"));
      return answer;
    };

    return Return;

  })(Base);

  exports.Value = Value = (function(_super) {
    __extends(Value, _super);

    function Value(base, props, tag) {
      if (!props && base instanceof Value) {
        return base;
      }
      this.base = base;
      this.properties = props || [];
      if (tag) {
        this[tag] = true;
      }
      return this;
    }

    Value.prototype.children = ['base', 'properties'];

    Value.prototype.add = function(props) {
      this.properties = this.properties.concat(props);
      return this;
    };

    Value.prototype.hasProperties = function() {
      return !!this.properties.length;
    };

    Value.prototype.bareLiteral = function(type) {
      return !this.properties.length && this.base instanceof type;
    };

    Value.prototype.isArray = function() {
      return this.bareLiteral(Arr);
    };

    Value.prototype.isRange = function() {
      return this.bareLiteral(Range);
    };

    Value.prototype.isComplex = function() {
      return this.hasProperties() || this.base.isComplex();
    };

    Value.prototype.isAssignable = function() {
      return this.hasProperties() || this.base.isAssignable();
    };

    Value.prototype.isSimpleNumber = function() {
      return this.bareLiteral(Literal) && SIMPLENUM.test(this.base.value);
    };

    Value.prototype.isString = function() {
      return this.bareLiteral(Literal) && IS_STRING.test(this.base.value);
    };

    Value.prototype.isRegex = function() {
      return this.bareLiteral(Literal) && IS_REGEX.test(this.base.value);
    };

    Value.prototype.isAtomic = function() {
      var node, _i, _len, _ref2;
      _ref2 = this.properties.concat(this.base);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        if (node.soak || node instanceof Call) {
          return false;
        }
      }
      return true;
    };

    Value.prototype.isNotCallable = function() {
      return this.isSimpleNumber() || this.isString() || this.isRegex() || this.isArray() || this.isRange() || this.isSplice() || this.isObject();
    };

    Value.prototype.isStatement = function(o) {
      return !this.properties.length && this.base.isStatement(o);
    };

    Value.prototype.assigns = function(name) {
      return !this.properties.length && this.base.assigns(name);
    };

    Value.prototype.jumps = function(o) {
      return !this.properties.length && this.base.jumps(o);
    };

    Value.prototype.isObject = function(onlyGenerated) {
      if (this.properties.length) {
        return false;
      }
      return (this.base instanceof Obj) && (!onlyGenerated || this.base.generated);
    };

    Value.prototype.isSplice = function() {
      return last(this.properties) instanceof Slice;
    };

    Value.prototype.looksStatic = function(className) {
      var _ref2;
      return this.base.value === className && this.properties.length && ((_ref2 = this.properties[0].name) != null ? _ref2.value : void 0) !== 'prototype';
    };

    Value.prototype.unwrap = function() {
      if (this.properties.length) {
        return this;
      } else {
        return this.base;
      }
    };

    Value.prototype.cacheReference = function(o) {
      var base, bref, name, nref;
      name = last(this.properties);
      if (this.properties.length < 2 && !this.base.isComplex() && !(name != null ? name.isComplex() : void 0)) {
        return [this, this];
      }
      base = new Value(this.base, this.properties.slice(0, -1));
      if (base.isComplex()) {
        bref = new Literal(o.scope.freeVariable('base'));
        base = new Value(new Parens(new Assign(bref, base)));
      }
      if (!name) {
        return [base, bref];
      }
      if (name.isComplex()) {
        nref = new Literal(o.scope.freeVariable('name'));
        name = new Index(new Assign(nref, name.index));
        nref = new Index(nref);
      }
      return [base.add(name), new Value(bref || base.base, [nref || name])];
    };

    Value.prototype.compileNode = function(o) {
      var fragments, prop, props, _i, _len;
      this.base.front = this.front;
      props = this.properties;
      fragments = this.base.compileToFragments(o, (props.length ? LEVEL_ACCESS : null));
      if ((this.base instanceof Parens || props.length) && SIMPLENUM.test(fragmentsToText(fragments))) {
        fragments.push(this.makeCode('.'));
      }
      for (_i = 0, _len = props.length; _i < _len; _i++) {
        prop = props[_i];
        fragments.push.apply(fragments, prop.compileToFragments(o));
      }
      return fragments;
    };

    Value.prototype.unfoldSoak = function(o) {
      return this.unfoldedSoak != null ? this.unfoldedSoak : this.unfoldedSoak = (function(_this) {
        return function() {
          var fst, i, ifn, prop, ref, snd, _i, _len, _ref2, _ref3;
          if (ifn = _this.base.unfoldSoak(o)) {
            (_ref2 = ifn.body.properties).push.apply(_ref2, _this.properties);
            return ifn;
          }
          _ref3 = _this.properties;
          for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
            prop = _ref3[i];
            if (!prop.soak) {
              continue;
            }
            prop.soak = false;
            fst = new Value(_this.base, _this.properties.slice(0, i));
            snd = new Value(_this.base, _this.properties.slice(i));
            if (fst.isComplex()) {
              ref = new Literal(o.scope.freeVariable('ref'));
              fst = new Parens(new Assign(ref, fst));
              snd.base = ref;
            }
            return new If(new Existence(fst), snd, {
              soak: true
            });
          }
          return false;
        };
      })(this)();
    };

    return Value;

  })(Base);

  exports.Comment = Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment(_at_comment) {
      this.comment = _at_comment;
    }

    Comment.prototype.isStatement = YES;

    Comment.prototype.makeReturn = THIS;

    Comment.prototype.compileNode = function(o, level) {
      var code, comment;
      comment = this.comment.replace(/^(\s*)# /gm, "$1 * ");
      code = "/*" + (multident(comment, this.tab)) + (__indexOf.call(comment, '\n') >= 0 ? "\n" + this.tab : '') + " */";
      if ((level || o.level) === LEVEL_TOP) {
        code = o.indent + code;
      }
      return [this.makeCode("\n"), this.makeCode(code)];
    };

    return Comment;

  })(Base);

  exports.Call = Call = (function(_super) {
    __extends(Call, _super);

    function Call(variable, _at_args, _at_soak) {
      this.args = _at_args != null ? _at_args : [];
      this.soak = _at_soak;
      this.isNew = false;
      this.isSuper = variable === 'super';
      this.variable = this.isSuper ? null : variable;
      if (variable instanceof Value && variable.isNotCallable()) {
        variable.error("literal is not a function");
      }
    }

    Call.prototype.children = ['variable', 'args'];

    Call.prototype.newInstance = function() {
      var base, _ref2;
      base = ((_ref2 = this.variable) != null ? _ref2.base : void 0) || this.variable;
      if (base instanceof Call && !base.isNew) {
        base.newInstance();
      } else {
        this.isNew = true;
      }
      return this;
    };

    Call.prototype.superReference = function(o) {
      var accesses, method;
      method = o.scope.namedMethod();
      if (method != null ? method.klass : void 0) {
        accesses = [new Access(new Literal('__super__'))];
        if (method["static"]) {
          accesses.push(new Access(new Literal('constructor')));
        }
        accesses.push(new Access(new Literal(method.name)));
        return (new Value(new Literal(method.klass), accesses)).compile(o);
      } else if (method != null ? method.ctor : void 0) {
        return method.name + ".__super__.constructor";
      } else {
        return this.error('cannot call super outside of an instance method.');
      }
    };

    Call.prototype.superThis = function(o) {
      var method;
      method = o.scope.method;
      return (method && !method.klass && method.context) || "this";
    };

    Call.prototype.unfoldSoak = function(o) {
      var call, ifn, left, list, rite, _i, _len, _ref2, _ref3;
      if (this.soak) {
        if (this.variable) {
          if (ifn = unfoldSoak(o, this, 'variable')) {
            return ifn;
          }
          _ref2 = new Value(this.variable).cacheReference(o), left = _ref2[0], rite = _ref2[1];
        } else {
          left = new Literal(this.superReference(o));
          rite = new Value(left);
        }
        rite = new Call(rite, this.args);
        rite.isNew = this.isNew;
        left = new Literal("typeof " + (left.compile(o)) + " === \"function\"");
        return new If(left, new Value(rite), {
          soak: true
        });
      }
      call = this;
      list = [];
      while (true) {
        if (call.variable instanceof Call) {
          list.push(call);
          call = call.variable;
          continue;
        }
        if (!(call.variable instanceof Value)) {
          break;
        }
        list.push(call);
        if (!((call = call.variable.base) instanceof Call)) {
          break;
        }
      }
      _ref3 = list.reverse();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        call = _ref3[_i];
        if (ifn) {
          if (call.variable instanceof Call) {
            call.variable = ifn;
          } else {
            call.variable.base = ifn;
          }
        }
        ifn = unfoldSoak(o, call, 'variable');
      }
      return ifn;
    };

    Call.prototype.compileNode = function(o) {
      var arg, argIndex, compiledArgs, compiledArray, fragments, preface, _i, _len, _ref2, _ref3;
      if ((_ref2 = this.variable) != null) {
        _ref2.front = this.front;
      }
      compiledArray = Splat.compileSplattedArray(o, this.args, true);
      if (compiledArray.length) {
        return this.compileSplat(o, compiledArray);
      }
      compiledArgs = [];
      _ref3 = this.args;
      for (argIndex = _i = 0, _len = _ref3.length; _i < _len; argIndex = ++_i) {
        arg = _ref3[argIndex];
        if (argIndex) {
          compiledArgs.push(this.makeCode(", "));
        }
        compiledArgs.push.apply(compiledArgs, arg.compileToFragments(o, LEVEL_LIST));
      }
      fragments = [];
      if (this.isSuper) {
        preface = this.superReference(o) + (".call(" + (this.superThis(o)));
        if (compiledArgs.length) {
          preface += ", ";
        }
        fragments.push(this.makeCode(preface));
      } else {
        if (this.isNew) {
          fragments.push(this.makeCode('new '));
        }
        fragments.push.apply(fragments, this.variable.compileToFragments(o, LEVEL_ACCESS));
        fragments.push(this.makeCode("("));
      }
      fragments.push.apply(fragments, compiledArgs);
      fragments.push(this.makeCode(")"));
      return fragments;
    };

    Call.prototype.compileSplat = function(o, splatArgs) {
      var answer, base, fun, idt, name, ref;
      if (this.isSuper) {
        return [].concat(this.makeCode((this.superReference(o)) + ".apply(" + (this.superThis(o)) + ", "), splatArgs, this.makeCode(")"));
      }
      if (this.isNew) {
        idt = this.tab + TAB;
        return [].concat(this.makeCode("(function(func, args, ctor) {\n" + idt + "ctor.prototype = func.prototype;\n" + idt + "var child = new ctor, result = func.apply(child, args);\n" + idt + "return Object(result) === result ? result : child;\n" + this.tab + "})("), this.variable.compileToFragments(o, LEVEL_LIST), this.makeCode(", "), splatArgs, this.makeCode(", function(){})"));
      }
      answer = [];
      base = new Value(this.variable);
      if ((name = base.properties.pop()) && base.isComplex()) {
        ref = o.scope.freeVariable('ref');
        answer = answer.concat(this.makeCode("(" + ref + " = "), base.compileToFragments(o, LEVEL_LIST), this.makeCode(")"), name.compileToFragments(o));
      } else {
        fun = base.compileToFragments(o, LEVEL_ACCESS);
        if (SIMPLENUM.test(fragmentsToText(fun))) {
          fun = this.wrapInBraces(fun);
        }
        if (name) {
          ref = fragmentsToText(fun);
          fun.push.apply(fun, name.compileToFragments(o));
        } else {
          ref = 'null';
        }
        answer = answer.concat(fun);
      }
      return answer = answer.concat(this.makeCode(".apply(" + ref + ", "), splatArgs, this.makeCode(")"));
    };

    return Call;

  })(Base);

  exports.Extends = Extends = (function(_super) {
    __extends(Extends, _super);

    function Extends(_at_child, _at_parent) {
      this.child = _at_child;
      this.parent = _at_parent;
    }

    Extends.prototype.children = ['child', 'parent'];

    Extends.prototype.compileToFragments = function(o) {
      return new Call(new Value(new Literal(utility('extends', o))), [this.child, this.parent]).compileToFragments(o);
    };

    return Extends;

  })(Base);

  exports.Access = Access = (function(_super) {
    __extends(Access, _super);

    function Access(_at_name, tag) {
      this.name = _at_name;
      this.name.asKey = true;
      this.soak = tag === 'soak';
    }

    Access.prototype.children = ['name'];

    Access.prototype.compileToFragments = function(o) {
      var name;
      name = this.name.compileToFragments(o);
      if (IDENTIFIER.test(fragmentsToText(name))) {
        name.unshift(this.makeCode("."));
      } else {
        name.unshift(this.makeCode("["));
        name.push(this.makeCode("]"));
      }
      return name;
    };

    Access.prototype.isComplex = NO;

    return Access;

  })(Base);

  exports.Index = Index = (function(_super) {
    __extends(Index, _super);

    function Index(_at_index) {
      this.index = _at_index;
    }

    Index.prototype.children = ['index'];

    Index.prototype.compileToFragments = function(o) {
      return [].concat(this.makeCode("["), this.index.compileToFragments(o, LEVEL_PAREN), this.makeCode("]"));
    };

    Index.prototype.isComplex = function() {
      return this.index.isComplex();
    };

    return Index;

  })(Base);

  exports.Range = Range = (function(_super) {
    __extends(Range, _super);

    Range.prototype.children = ['from', 'to'];

    function Range(_at_from, _at_to, tag) {
      this.from = _at_from;
      this.to = _at_to;
      this.exclusive = tag === 'exclusive';
      this.equals = this.exclusive ? '' : '=';
    }

    Range.prototype.compileVariables = function(o) {
      var step, _ref2, _ref3, _ref4, _ref5;
      o = merge(o, {
        top: true
      });
      _ref2 = this.cacheToCodeFragments(this.from.cache(o, LEVEL_LIST)), this.fromC = _ref2[0], this.fromVar = _ref2[1];
      _ref3 = this.cacheToCodeFragments(this.to.cache(o, LEVEL_LIST)), this.toC = _ref3[0], this.toVar = _ref3[1];
      if (step = del(o, 'step')) {
        _ref4 = this.cacheToCodeFragments(step.cache(o, LEVEL_LIST)), this.step = _ref4[0], this.stepVar = _ref4[1];
      }
      _ref5 = [this.fromVar.match(NUMBER), this.toVar.match(NUMBER)], this.fromNum = _ref5[0], this.toNum = _ref5[1];
      if (this.stepVar) {
        return this.stepNum = this.stepVar.match(NUMBER);
      }
    };

    Range.prototype.compileNode = function(o) {
      var cond, condPart, from, gt, idx, idxName, known, lt, namedIndex, stepPart, to, varPart, _ref2, _ref3;
      if (!this.fromVar) {
        this.compileVariables(o);
      }
      if (!o.index) {
        return this.compileArray(o);
      }
      known = this.fromNum && this.toNum;
      idx = del(o, 'index');
      idxName = del(o, 'name');
      namedIndex = idxName && idxName !== idx;
      varPart = idx + " = " + this.fromC;
      if (this.toC !== this.toVar) {
        varPart += ", " + this.toC;
      }
      if (this.step !== this.stepVar) {
        varPart += ", " + this.step;
      }
      _ref2 = [idx + " <" + this.equals, idx + " >" + this.equals], lt = _ref2[0], gt = _ref2[1];
      condPart = this.stepNum ? parseNum(this.stepNum[0]) > 0 ? lt + " " + this.toVar : gt + " " + this.toVar : known ? ((_ref3 = [parseNum(this.fromNum[0]), parseNum(this.toNum[0])], from = _ref3[0], to = _ref3[1], _ref3), from <= to ? lt + " " + to : gt + " " + to) : (cond = this.stepVar ? this.stepVar + " > 0" : this.fromVar + " <= " + this.toVar, cond + " ? " + lt + " " + this.toVar + " : " + gt + " " + this.toVar);
      stepPart = this.stepVar ? idx + " += " + this.stepVar : known ? namedIndex ? from <= to ? "++" + idx : "--" + idx : from <= to ? idx + "++" : idx + "--" : namedIndex ? cond + " ? ++" + idx + " : --" + idx : cond + " ? " + idx + "++ : " + idx + "--";
      if (namedIndex) {
        varPart = idxName + " = " + varPart;
      }
      if (namedIndex) {
        stepPart = idxName + " = " + stepPart;
      }
      return [this.makeCode(varPart + "; " + condPart + "; " + stepPart)];
    };

    Range.prototype.compileArray = function(o) {
      var args, body, cond, hasArgs, i, idt, post, pre, range, result, vars, _i, _ref2, _ref3, _results;
      if (this.fromNum && this.toNum && Math.abs(this.fromNum - this.toNum) <= 20) {
        range = (function() {
          _results = [];
          for (var _i = _ref2 = +this.fromNum, _ref3 = +this.toNum; _ref2 <= _ref3 ? _i <= _ref3 : _i >= _ref3; _ref2 <= _ref3 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
        if (this.exclusive) {
          range.pop();
        }
        return [this.makeCode("[" + (range.join(', ')) + "]")];
      }
      idt = this.tab + TAB;
      i = o.scope.freeVariable('i');
      result = o.scope.freeVariable('results');
      pre = "\n" + idt + result + " = [];";
      if (this.fromNum && this.toNum) {
        o.index = i;
        body = fragmentsToText(this.compileNode(o));
      } else {
        vars = (i + " = " + this.fromC) + (this.toC !== this.toVar ? ", " + this.toC : '');
        cond = this.fromVar + " <= " + this.toVar;
        body = "var " + vars + "; " + cond + " ? " + i + " <" + this.equals + " " + this.toVar + " : " + i + " >" + this.equals + " " + this.toVar + "; " + cond + " ? " + i + "++ : " + i + "--";
      }
      post = "{ " + result + ".push(" + i + "); }\n" + idt + "return " + result + ";\n" + o.indent;
      hasArgs = function(node) {
        return node != null ? node.contains(isLiteralArguments) : void 0;
      };
      if (hasArgs(this.from) || hasArgs(this.to)) {
        args = ', arguments';
      }
      return [this.makeCode("(function() {" + pre + "\n" + idt + "for (" + body + ")" + post + "}).apply(this" + (args != null ? args : '') + ")")];
    };

    return Range;

  })(Base);

  exports.Slice = Slice = (function(_super) {
    __extends(Slice, _super);

    Slice.prototype.children = ['range'];

    function Slice(_at_range) {
      this.range = _at_range;
      Slice.__super__.constructor.call(this);
    }

    Slice.prototype.compileNode = function(o) {
      var compiled, compiledText, from, fromCompiled, to, toStr, _ref2;
      _ref2 = this.range, to = _ref2.to, from = _ref2.from;
      fromCompiled = from && from.compileToFragments(o, LEVEL_PAREN) || [this.makeCode('0')];
      if (to) {
        compiled = to.compileToFragments(o, LEVEL_PAREN);
        compiledText = fragmentsToText(compiled);
        if (!(!this.range.exclusive && +compiledText === -1)) {
          toStr = ', ' + (this.range.exclusive ? compiledText : SIMPLENUM.test(compiledText) ? "" + (+compiledText + 1) : (compiled = to.compileToFragments(o, LEVEL_ACCESS), "+" + (fragmentsToText(compiled)) + " + 1 || 9e9"));
        }
      }
      return [this.makeCode(".slice(" + (fragmentsToText(fromCompiled)) + (toStr || '') + ")")];
    };

    return Slice;

  })(Base);

  exports.Obj = Obj = (function(_super) {
    __extends(Obj, _super);

    function Obj(props, _at_generated) {
      this.generated = _at_generated != null ? _at_generated : false;
      this.objects = this.properties = props || [];
    }

    Obj.prototype.children = ['properties'];

    Obj.prototype.compileNode = function(o) {
      var answer, i, idt, indent, join, lastNoncom, node, prop, props, _i, _j, _len, _len1;
      props = this.properties;
      if (!props.length) {
        return [this.makeCode(this.front ? '({})' : '{}')];
      }
      if (this.generated) {
        for (_i = 0, _len = props.length; _i < _len; _i++) {
          node = props[_i];
          if (node instanceof Value) {
            node.error('cannot have an implicit value in an implicit object');
          }
        }
      }
      idt = o.indent += TAB;
      lastNoncom = this.lastNonComment(this.properties);
      answer = [];
      for (i = _j = 0, _len1 = props.length; _j < _len1; i = ++_j) {
        prop = props[i];
        join = i === props.length - 1 ? '' : prop === lastNoncom || prop instanceof Comment ? '\n' : ',\n';
        indent = prop instanceof Comment ? '' : idt;
        if (prop instanceof Assign && prop.variable instanceof Value && prop.variable.hasProperties()) {
          prop.variable.error('Invalid object key');
        }
        if (prop instanceof Value && prop["this"]) {
          prop = new Assign(prop.properties[0].name, prop, 'object');
        }
        if (!(prop instanceof Comment)) {
          if (!(prop instanceof Assign)) {
            prop = new Assign(prop, prop, 'object');
          }
          (prop.variable.base || prop.variable).asKey = true;
        }
        if (indent) {
          answer.push(this.makeCode(indent));
        }
        answer.push.apply(answer, prop.compileToFragments(o, LEVEL_TOP));
        if (join) {
          answer.push(this.makeCode(join));
        }
      }
      answer.unshift(this.makeCode("{" + (props.length && '\n')));
      answer.push(this.makeCode((props.length && '\n' + this.tab) + "}"));
      if (this.front) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    Obj.prototype.assigns = function(name) {
      var prop, _i, _len, _ref2;
      _ref2 = this.properties;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        prop = _ref2[_i];
        if (prop.assigns(name)) {
          return true;
        }
      }
      return false;
    };

    return Obj;

  })(Base);

  exports.Arr = Arr = (function(_super) {
    __extends(Arr, _super);

    function Arr(objs) {
      this.objects = objs || [];
    }

    Arr.prototype.children = ['objects'];

    Arr.prototype.compileNode = function(o) {
      var answer, compiledObjs, fragments, index, obj, _i, _len;
      if (!this.objects.length) {
        return [this.makeCode('[]')];
      }
      o.indent += TAB;
      answer = Splat.compileSplattedArray(o, this.objects);
      if (answer.length) {
        return answer;
      }
      answer = [];
      compiledObjs = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = this.objects;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          obj = _ref2[_i];
          _results.push(obj.compileToFragments(o, LEVEL_LIST));
        }
        return _results;
      }).call(this);
      for (index = _i = 0, _len = compiledObjs.length; _i < _len; index = ++_i) {
        fragments = compiledObjs[index];
        if (index) {
          answer.push(this.makeCode(", "));
        }
        answer.push.apply(answer, fragments);
      }
      if (fragmentsToText(answer).indexOf('\n') >= 0) {
        answer.unshift(this.makeCode("[\n" + o.indent));
        answer.push(this.makeCode("\n" + this.tab + "]"));
      } else {
        answer.unshift(this.makeCode("["));
        answer.push(this.makeCode("]"));
      }
      return answer;
    };

    Arr.prototype.assigns = function(name) {
      var obj, _i, _len, _ref2;
      _ref2 = this.objects;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        obj = _ref2[_i];
        if (obj.assigns(name)) {
          return true;
        }
      }
      return false;
    };

    return Arr;

  })(Base);

  exports.Class = Class = (function(_super) {
    __extends(Class, _super);

    function Class(_at_variable, _at_parent, _at_body) {
      this.variable = _at_variable;
      this.parent = _at_parent;
      this.body = _at_body != null ? _at_body : new Block;
      this.boundFuncs = [];
      this.body.classBody = true;
    }

    Class.prototype.children = ['variable', 'parent', 'body'];

    Class.prototype.determineName = function() {
      var decl, tail;
      if (!this.variable) {
        return null;
      }
      decl = (tail = last(this.variable.properties)) ? tail instanceof Access && tail.name.value : this.variable.base.value;
      if (__indexOf.call(STRICT_PROSCRIBED, decl) >= 0) {
        this.variable.error("class variable name may not be " + decl);
      }
      return decl && (decl = IDENTIFIER.test(decl) && decl);
    };

    Class.prototype.setContext = function(name) {
      return this.body.traverseChildren(false, function(node) {
        if (node.classBody) {
          return false;
        }
        if (node instanceof Literal && node.value === 'this') {
          return node.value = name;
        } else if (node instanceof Code) {
          node.klass = name;
          if (node.bound) {
            return node.context = name;
          }
        }
      });
    };

    Class.prototype.addBoundFunctions = function(o) {
      var bvar, lhs, _i, _len, _ref2;
      _ref2 = this.boundFuncs;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        bvar = _ref2[_i];
        lhs = (new Value(new Literal("this"), [new Access(bvar)])).compile(o);
        this.ctor.body.unshift(new Literal(lhs + " = " + (utility('bind', o)) + "(" + lhs + ", this)"));
      }
    };

    Class.prototype.addProperties = function(node, name, o) {
      var assign, base, exprs, func, props;
      props = node.base.properties.slice(0);
      exprs = (function() {
        var _results;
        _results = [];
        while (assign = props.shift()) {
          if (assign instanceof Assign) {
            base = assign.variable.base;
            delete assign.context;
            func = assign.value;
            if (base.value === 'constructor') {
              if (this.ctor) {
                assign.error('cannot define more than one constructor in a class');
              }
              if (func.bound) {
                assign.error('cannot define a constructor as a bound function');
              }
              if (func instanceof Code) {
                assign = this.ctor = func;
              } else {
                this.externalCtor = o.classScope.freeVariable('class');
                assign = new Assign(new Literal(this.externalCtor), func);
              }
            } else {
              if (assign.variable["this"]) {
                func["static"] = true;
              } else {
                assign.variable = new Value(new Literal(name), [new Access(new Literal('prototype')), new Access(base)]);
                if (func instanceof Code && func.bound) {
                  this.boundFuncs.push(base);
                  func.bound = false;
                }
              }
            }
          }
          _results.push(assign);
        }
        return _results;
      }).call(this);
      return compact(exprs);
    };

    Class.prototype.walkBody = function(name, o) {
      return this.traverseChildren(false, (function(_this) {
        return function(child) {
          var cont, exps, i, node, _i, _len, _ref2;
          cont = true;
          if (child instanceof Class) {
            return false;
          }
          if (child instanceof Block) {
            _ref2 = exps = child.expressions;
            for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
              node = _ref2[i];
              if (node instanceof Assign && node.variable.looksStatic(name)) {
                node.value["static"] = true;
              } else if (node instanceof Value && node.isObject(true)) {
                cont = false;
                exps[i] = _this.addProperties(node, name, o);
              }
            }
            child.expressions = exps = flatten(exps);
          }
          return cont && !(child instanceof Class);
        };
      })(this));
    };

    Class.prototype.hoistDirectivePrologue = function() {
      var expressions, index, node;
      index = 0;
      expressions = this.body.expressions;
      while ((node = expressions[index]) && node instanceof Comment || node instanceof Value && node.isString()) {
        ++index;
      }
      return this.directives = expressions.splice(0, index);
    };

    Class.prototype.ensureConstructor = function(name) {
      if (!this.ctor) {
        this.ctor = new Code;
        if (this.externalCtor) {
          this.ctor.body.push(new Literal(this.externalCtor + ".apply(this, arguments)"));
        } else if (this.parent) {
          this.ctor.body.push(new Literal(name + ".__super__.constructor.apply(this, arguments)"));
        }
        this.ctor.body.makeReturn();
        this.body.expressions.unshift(this.ctor);
      }
      this.ctor.ctor = this.ctor.name = name;
      this.ctor.klass = null;
      return this.ctor.noReturn = true;
    };

    Class.prototype.compileNode = function(o) {
      var args, argumentsNode, func, jumpNode, klass, lname, name, superClass, _ref2;
      if (jumpNode = this.body.jumps()) {
        jumpNode.error('Class bodies cannot contain pure statements');
      }
      if (argumentsNode = this.body.contains(isLiteralArguments)) {
        argumentsNode.error("Class bodies shouldn't reference arguments");
      }
      name = this.determineName() || '_Class';
      if (name.reserved) {
        name = "_" + name;
      }
      lname = new Literal(name);
      func = new Code([], Block.wrap([this.body]));
      args = [];
      o.classScope = func.makeScope(o.scope);
      this.hoistDirectivePrologue();
      this.setContext(name);
      this.walkBody(name, o);
      this.ensureConstructor(name);
      this.addBoundFunctions(o);
      this.body.spaced = true;
      this.body.expressions.push(lname);
      if (this.parent) {
        superClass = new Literal(o.classScope.freeVariable('super', false));
        this.body.expressions.unshift(new Extends(lname, superClass));
        func.params.push(new Param(superClass));
        args.push(this.parent);
      }
      (_ref2 = this.body.expressions).unshift.apply(_ref2, this.directives);
      klass = new Parens(new Call(func, args));
      if (this.variable) {
        klass = new Assign(this.variable, klass);
      }
      return klass.compileToFragments(o);
    };

    return Class;

  })(Base);

  exports.Assign = Assign = (function(_super) {
    __extends(Assign, _super);

    function Assign(_at_variable, _at_value, _at_context, options) {
      var forbidden, name, _ref2;
      this.variable = _at_variable;
      this.value = _at_value;
      this.context = _at_context;
      this.param = options && options.param;
      this.subpattern = options && options.subpattern;
      forbidden = (_ref2 = (name = this.variable.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0);
      if (forbidden && this.context !== 'object') {
        this.variable.error("variable name may not be \"" + name + "\"");
      }
    }

    Assign.prototype.children = ['variable', 'value'];

    Assign.prototype.isStatement = function(o) {
      return (o != null ? o.level : void 0) === LEVEL_TOP && (this.context != null) && __indexOf.call(this.context, "?") >= 0;
    };

    Assign.prototype.assigns = function(name) {
      return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
    };

    Assign.prototype.unfoldSoak = function(o) {
      return unfoldSoak(o, this, 'variable');
    };

    Assign.prototype.compileNode = function(o) {
      var answer, compiledName, isValue, match, name, val, varBase, _ref2, _ref3, _ref4, _ref5;
      if (isValue = this.variable instanceof Value) {
        if (this.variable.isArray() || this.variable.isObject()) {
          return this.compilePatternMatch(o);
        }
        if (this.variable.isSplice()) {
          return this.compileSplice(o);
        }
        if ((_ref2 = this.context) === '||=' || _ref2 === '&&=' || _ref2 === '?=') {
          return this.compileConditional(o);
        }
        if ((_ref3 = this.context) === '**=' || _ref3 === '//=' || _ref3 === '%%=') {
          return this.compileSpecialMath(o);
        }
      }
      compiledName = this.variable.compileToFragments(o, LEVEL_LIST);
      name = fragmentsToText(compiledName);
      if (!this.context) {
        varBase = this.variable.unwrapAll();
        if (!varBase.isAssignable()) {
          this.variable.error("\"" + (this.variable.compile(o)) + "\" cannot be assigned");
        }
        if (!(typeof varBase.hasProperties === "function" ? varBase.hasProperties() : void 0)) {
          if (this.param) {
            o.scope.add(name, 'var');
          } else {
            o.scope.find(name);
          }
        }
      }
      if (this.value instanceof Code && (match = METHOD_DEF.exec(name))) {
        if (match[2]) {
          this.value.klass = match[1];
        }
        this.value.name = (_ref4 = (_ref5 = match[3]) != null ? _ref5 : match[4]) != null ? _ref4 : match[5];
      }
      val = this.value.compileToFragments(o, LEVEL_LIST);
      if (this.context === 'object') {
        return compiledName.concat(this.makeCode(": "), val);
      }
      answer = compiledName.concat(this.makeCode(" " + (this.context || '=') + " "), val);
      if (o.level <= LEVEL_LIST) {
        return answer;
      } else {
        return this.wrapInBraces(answer);
      }
    };

    Assign.prototype.compilePatternMatch = function(o) {
      var acc, assigns, code, expandedIdx, fragments, i, idx, isObject, ivar, name, obj, objects, olen, ref, rest, top, val, value, vvar, vvarText, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      top = o.level === LEVEL_TOP;
      value = this.value;
      objects = this.variable.base.objects;
      if (!(olen = objects.length)) {
        code = value.compileToFragments(o);
        if (o.level >= LEVEL_OP) {
          return this.wrapInBraces(code);
        } else {
          return code;
        }
      }
      isObject = this.variable.isObject();
      if (top && olen === 1 && !((obj = objects[0]) instanceof Splat)) {
        if (obj instanceof Assign) {
          _ref2 = obj, (_ref3 = _ref2.variable, idx = _ref3.base), obj = _ref2.value;
        } else {
          idx = isObject ? obj["this"] ? obj.properties[0].name : obj : new Literal(0);
        }
        acc = IDENTIFIER.test(idx.unwrap().value || 0);
        value = new Value(value);
        value.properties.push(new (acc ? Access : Index)(idx));
        if (_ref4 = obj.unwrap().value, __indexOf.call(RESERVED, _ref4) >= 0) {
          obj.error("assignment to a reserved word: " + (obj.compile(o)));
        }
        return new Assign(obj, value, null, {
          param: this.param
        }).compileToFragments(o, LEVEL_TOP);
      }
      vvar = value.compileToFragments(o, LEVEL_LIST);
      vvarText = fragmentsToText(vvar);
      assigns = [];
      expandedIdx = false;
      if (!IDENTIFIER.test(vvarText) || this.variable.assigns(vvarText)) {
        assigns.push([this.makeCode((ref = o.scope.freeVariable('ref')) + " = ")].concat(__slice.call(vvar)));
        vvar = [this.makeCode(ref)];
        vvarText = ref;
      }
      for (i = _i = 0, _len = objects.length; _i < _len; i = ++_i) {
        obj = objects[i];
        idx = i;
        if (isObject) {
          if (obj instanceof Assign) {
            _ref5 = obj, (_ref6 = _ref5.variable, idx = _ref6.base), obj = _ref5.value;
          } else {
            if (obj.base instanceof Parens) {
              _ref7 = new Value(obj.unwrapAll()).cacheReference(o), obj = _ref7[0], idx = _ref7[1];
            } else {
              idx = obj["this"] ? obj.properties[0].name : obj;
            }
          }
        }
        if (!expandedIdx && obj instanceof Splat) {
          name = obj.name.unwrap().value;
          obj = obj.unwrap();
          val = olen + " <= " + vvarText + ".length ? " + (utility('slice', o)) + ".call(" + vvarText + ", " + i;
          if (rest = olen - i - 1) {
            ivar = o.scope.freeVariable('i');
            val += ", " + ivar + " = " + vvarText + ".length - " + rest + ") : (" + ivar + " = " + i + ", [])";
          } else {
            val += ") : []";
          }
          val = new Literal(val);
          expandedIdx = ivar + "++";
        } else if (!expandedIdx && obj instanceof Expansion) {
          if (rest = olen - i - 1) {
            if (rest === 1) {
              expandedIdx = vvarText + ".length - 1";
            } else {
              ivar = o.scope.freeVariable('i');
              val = new Literal(ivar + " = " + vvarText + ".length - " + rest);
              expandedIdx = ivar + "++";
              assigns.push(val.compileToFragments(o, LEVEL_LIST));
            }
          }
          continue;
        } else {
          name = obj.unwrap().value;
          if (obj instanceof Splat || obj instanceof Expansion) {
            obj.error("multiple splats/expansions are disallowed in an assignment");
          }
          if (typeof idx === 'number') {
            idx = new Literal(expandedIdx || idx);
            acc = false;
          } else {
            acc = isObject && IDENTIFIER.test(idx.unwrap().value || 0);
          }
          val = new Value(new Literal(vvarText), [new (acc ? Access : Index)(idx)]);
        }
        if ((name != null) && __indexOf.call(RESERVED, name) >= 0) {
          obj.error("assignment to a reserved word: " + (obj.compile(o)));
        }
        assigns.push(new Assign(obj, val, null, {
          param: this.param,
          subpattern: true
        }).compileToFragments(o, LEVEL_LIST));
      }
      if (!(top || this.subpattern)) {
        assigns.push(vvar);
      }
      fragments = this.joinFragmentArrays(assigns, ', ');
      if (o.level < LEVEL_LIST) {
        return fragments;
      } else {
        return this.wrapInBraces(fragments);
      }
    };

    Assign.prototype.compileConditional = function(o) {
      var fragments, left, right, _ref2;
      _ref2 = this.variable.cacheReference(o), left = _ref2[0], right = _ref2[1];
      if (!left.properties.length && left.base instanceof Literal && left.base.value !== "this" && !o.scope.check(left.base.value)) {
        this.variable.error("the variable \"" + left.base.value + "\" can't be assigned with " + this.context + " because it has not been declared before");
      }
      if (__indexOf.call(this.context, "?") >= 0) {
        o.isExistentialEquals = true;
        return new If(new Existence(left), right, {
          type: 'if'
        }).addElse(new Assign(right, this.value, '=')).compileToFragments(o);
      } else {
        fragments = new Op(this.context.slice(0, -1), left, new Assign(right, this.value, '=')).compileToFragments(o);
        if (o.level <= LEVEL_LIST) {
          return fragments;
        } else {
          return this.wrapInBraces(fragments);
        }
      }
    };

    Assign.prototype.compileSpecialMath = function(o) {
      var left, right, _ref2;
      _ref2 = this.variable.cacheReference(o), left = _ref2[0], right = _ref2[1];
      return new Assign(left, new Op(this.context.slice(0, -1), right, this.value)).compileToFragments(o);
    };

    Assign.prototype.compileSplice = function(o) {
      var answer, exclusive, from, fromDecl, fromRef, name, to, valDef, valRef, _ref2, _ref3, _ref4;
      _ref2 = this.variable.properties.pop().range, from = _ref2.from, to = _ref2.to, exclusive = _ref2.exclusive;
      name = this.variable.compile(o);
      if (from) {
        _ref3 = this.cacheToCodeFragments(from.cache(o, LEVEL_OP)), fromDecl = _ref3[0], fromRef = _ref3[1];
      } else {
        fromDecl = fromRef = '0';
      }
      if (to) {
        if (from instanceof Value && from.isSimpleNumber() && to instanceof Value && to.isSimpleNumber()) {
          to = to.compile(o) - fromRef;
          if (!exclusive) {
            to += 1;
          }
        } else {
          to = to.compile(o, LEVEL_ACCESS) + ' - ' + fromRef;
          if (!exclusive) {
            to += ' + 1';
          }
        }
      } else {
        to = "9e9";
      }
      _ref4 = this.value.cache(o, LEVEL_LIST), valDef = _ref4[0], valRef = _ref4[1];
      answer = [].concat(this.makeCode("[].splice.apply(" + name + ", [" + fromDecl + ", " + to + "].concat("), valDef, this.makeCode(")), "), valRef);
      if (o.level > LEVEL_TOP) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    return Assign;

  })(Base);

  exports.Code = Code = (function(_super) {
    __extends(Code, _super);

    function Code(params, body, tag) {
      this.params = params || [];
      this.body = body || new Block;
      this.bound = tag === 'boundfunc';
      this.isGenerator = !!this.body.contains(function(node) {
        var _ref2;
        return node instanceof Op && ((_ref2 = node.operator) === 'yield' || _ref2 === 'yield*');
      });
    }

    Code.prototype.children = ['params', 'body'];

    Code.prototype.isStatement = function() {
      return !!this.ctor;
    };

    Code.prototype.jumps = NO;

    Code.prototype.makeScope = function(parentScope) {
      return new Scope(parentScope, this.body, this);
    };

    Code.prototype.compileNode = function(o) {
      var answer, boundfunc, code, exprs, i, lit, p, param, params, ref, splats, uniqs, val, wasEmpty, wrapper, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      if (this.bound && ((_ref2 = o.scope.method) != null ? _ref2.bound : void 0)) {
        this.context = o.scope.method.context;
      }
      if (this.bound && !this.context) {
        this.context = '_this';
        wrapper = new Code([new Param(new Literal(this.context))], new Block([this]));
        boundfunc = new Call(wrapper, [new Literal('this')]);
        boundfunc.updateLocationDataIfMissing(this.locationData);
        return boundfunc.compileNode(o);
      }
      o.scope = del(o, 'classScope') || this.makeScope(o.scope);
      o.scope.shared = del(o, 'sharedScope');
      o.indent += TAB;
      delete o.bare;
      delete o.isExistentialEquals;
      params = [];
      exprs = [];
      _ref3 = this.params;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        param = _ref3[_i];
        if (!(param instanceof Expansion)) {
          o.scope.parameter(param.asReference(o));
        }
      }
      _ref4 = this.params;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        param = _ref4[_j];
        if (!(param.splat || param instanceof Expansion)) {
          continue;
        }
        _ref5 = this.params;
        for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
          p = _ref5[_k];
          if (!(p instanceof Expansion) && p.name.value) {
            o.scope.add(p.name.value, 'var', true);
          }
        }
        splats = new Assign(new Value(new Arr((function() {
          var _l, _len3, _ref6, _results;
          _ref6 = this.params;
          _results = [];
          for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
            p = _ref6[_l];
            _results.push(p.asReference(o));
          }
          return _results;
        }).call(this))), new Value(new Literal('arguments')));
        break;
      }
      _ref6 = this.params;
      for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
        param = _ref6[_l];
        if (param.isComplex()) {
          val = ref = param.asReference(o);
          if (param.value) {
            val = new Op('?', ref, param.value);
          }
          exprs.push(new Assign(new Value(param.name), val, '=', {
            param: true
          }));
        } else {
          ref = param;
          if (param.value) {
            lit = new Literal(ref.name.value + ' == null');
            val = new Assign(new Value(param.name), param.value, '=');
            exprs.push(new If(lit, val));
          }
        }
        if (!splats) {
          params.push(ref);
        }
      }
      wasEmpty = this.body.isEmpty();
      if (splats) {
        exprs.unshift(splats);
      }
      if (exprs.length) {
        (_ref7 = this.body.expressions).unshift.apply(_ref7, exprs);
      }
      for (i = _m = 0, _len4 = params.length; _m < _len4; i = ++_m) {
        p = params[i];
        params[i] = p.compileToFragments(o);
        o.scope.parameter(fragmentsToText(params[i]));
      }
      uniqs = [];
      this.eachParamName(function(name, node) {
        if (__indexOf.call(uniqs, name) >= 0) {
          node.error("multiple parameters named " + name);
        }
        return uniqs.push(name);
      });
      if (!(wasEmpty || this.noReturn)) {
        this.body.makeReturn();
      }
      code = 'function';
      if (this.isGenerator) {
        code += '*';
      }
      if (this.ctor) {
        code += ' ' + this.name;
      }
      code += '(';
      answer = [this.makeCode(code)];
      for (i = _n = 0, _len5 = params.length; _n < _len5; i = ++_n) {
        p = params[i];
        if (i) {
          answer.push(this.makeCode(", "));
        }
        answer.push.apply(answer, p);
      }
      answer.push(this.makeCode(') {'));
      if (!this.body.isEmpty()) {
        answer = answer.concat(this.makeCode("\n"), this.body.compileWithDeclarations(o), this.makeCode("\n" + this.tab));
      }
      answer.push(this.makeCode('}'));
      if (this.ctor) {
        return [this.makeCode(this.tab)].concat(__slice.call(answer));
      }
      if (this.front || (o.level >= LEVEL_ACCESS)) {
        return this.wrapInBraces(answer);
      } else {
        return answer;
      }
    };

    Code.prototype.eachParamName = function(iterator) {
      var param, _i, _len, _ref2, _results;
      _ref2 = this.params;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        param = _ref2[_i];
        _results.push(param.eachName(iterator));
      }
      return _results;
    };

    Code.prototype.traverseChildren = function(crossScope, func) {
      if (crossScope) {
        return Code.__super__.traverseChildren.call(this, crossScope, func);
      }
    };

    return Code;

  })(Base);

  exports.Param = Param = (function(_super) {
    __extends(Param, _super);

    function Param(_at_name, _at_value, _at_splat) {
      var name, _ref2;
      this.name = _at_name;
      this.value = _at_value;
      this.splat = _at_splat;
      if (_ref2 = (name = this.name.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0) {
        this.name.error("parameter name \"" + name + "\" is not allowed");
      }
    }

    Param.prototype.children = ['name', 'value'];

    Param.prototype.compileToFragments = function(o) {
      return this.name.compileToFragments(o, LEVEL_LIST);
    };

    Param.prototype.asReference = function(o) {
      var name, node;
      if (this.reference) {
        return this.reference;
      }
      node = this.name;
      if (node["this"]) {
        name = "at_" + node.properties[0].name.value;
        node = new Literal(o.scope.freeVariable(name));
      } else if (node.isComplex()) {
        node = new Literal(o.scope.freeVariable('arg'));
      }
      node = new Value(node);
      if (this.splat) {
        node = new Splat(node);
      }
      node.updateLocationDataIfMissing(this.locationData);
      return this.reference = node;
    };

    Param.prototype.isComplex = function() {
      return this.name.isComplex();
    };

    Param.prototype.eachName = function(iterator, name) {
      var atParam, node, obj, _i, _len, _ref2;
      if (name == null) {
        name = this.name;
      }
      atParam = function(obj) {
        return iterator("@" + obj.properties[0].name.value, obj);
      };
      if (name instanceof Literal) {
        return iterator(name.value, name);
      }
      if (name instanceof Value) {
        return atParam(name);
      }
      _ref2 = name.objects;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        obj = _ref2[_i];
        if (obj instanceof Assign) {
          this.eachName(iterator, obj.value.unwrap());
        } else if (obj instanceof Splat) {
          node = obj.name.unwrap();
          iterator(node.value, node);
        } else if (obj instanceof Value) {
          if (obj.isArray() || obj.isObject()) {
            this.eachName(iterator, obj.base);
          } else if (obj["this"]) {
            atParam(obj);
          } else {
            iterator(obj.base.value, obj.base);
          }
        } else if (!(obj instanceof Expansion)) {
          obj.error("illegal parameter " + (obj.compile()));
        }
      }
    };

    return Param;

  })(Base);

  exports.Splat = Splat = (function(_super) {
    __extends(Splat, _super);

    Splat.prototype.children = ['name'];

    Splat.prototype.isAssignable = YES;

    function Splat(name) {
      this.name = name.compile ? name : new Literal(name);
    }

    Splat.prototype.assigns = function(name) {
      return this.name.assigns(name);
    };

    Splat.prototype.compileToFragments = function(o) {
      return this.name.compileToFragments(o);
    };

    Splat.prototype.unwrap = function() {
      return this.name;
    };

    Splat.compileSplattedArray = function(o, list, apply) {
      var args, base, compiledNode, concatPart, fragments, i, index, node, _i, _len;
      index = -1;
      while ((node = list[++index]) && !(node instanceof Splat)) {
        continue;
      }
      if (index >= list.length) {
        return [];
      }
      if (list.length === 1) {
        node = list[0];
        fragments = node.compileToFragments(o, LEVEL_LIST);
        if (apply) {
          return fragments;
        }
        return [].concat(node.makeCode((utility('slice', o)) + ".call("), fragments, node.makeCode(")"));
      }
      args = list.slice(index);
      for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
        node = args[i];
        compiledNode = node.compileToFragments(o, LEVEL_LIST);
        args[i] = node instanceof Splat ? [].concat(node.makeCode((utility('slice', o)) + ".call("), compiledNode, node.makeCode(")")) : [].concat(node.makeCode("["), compiledNode, node.makeCode("]"));
      }
      if (index === 0) {
        node = list[0];
        concatPart = node.joinFragmentArrays(args.slice(1), ', ');
        return args[0].concat(node.makeCode(".concat("), concatPart, node.makeCode(")"));
      }
      base = (function() {
        var _j, _len1, _ref2, _results;
        _ref2 = list.slice(0, index);
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          node = _ref2[_j];
          _results.push(node.compileToFragments(o, LEVEL_LIST));
        }
        return _results;
      })();
      base = list[0].joinFragmentArrays(base, ', ');
      concatPart = list[index].joinFragmentArrays(args, ', ');
      return [].concat(list[0].makeCode("["), base, list[index].makeCode("].concat("), concatPart, (last(list)).makeCode(")"));
    };

    return Splat;

  })(Base);

  exports.Expansion = Expansion = (function(_super) {
    __extends(Expansion, _super);

    function Expansion() {
      return Expansion.__super__.constructor.apply(this, arguments);
    }

    Expansion.prototype.isComplex = NO;

    Expansion.prototype.compileNode = function(o) {
      return this.error('Expansion must be used inside a destructuring assignment or parameter list');
    };

    Expansion.prototype.asReference = function(o) {
      return this;
    };

    Expansion.prototype.eachName = function(iterator) {};

    return Expansion;

  })(Base);

  exports.While = While = (function(_super) {
    __extends(While, _super);

    function While(condition, options) {
      this.condition = (options != null ? options.invert : void 0) ? condition.invert() : condition;
      this.guard = options != null ? options.guard : void 0;
    }

    While.prototype.children = ['condition', 'guard', 'body'];

    While.prototype.isStatement = YES;

    While.prototype.makeReturn = function(res) {
      if (res) {
        return While.__super__.makeReturn.apply(this, arguments);
      } else {
        this.returns = !this.jumps({
          loop: true
        });
        return this;
      }
    };

    While.prototype.addBody = function(_at_body) {
      this.body = _at_body;
      return this;
    };

    While.prototype.jumps = function() {
      var expressions, jumpNode, node, _i, _len;
      expressions = this.body.expressions;
      if (!expressions.length) {
        return false;
      }
      for (_i = 0, _len = expressions.length; _i < _len; _i++) {
        node = expressions[_i];
        if (jumpNode = node.jumps({
          loop: true
        })) {
          return jumpNode;
        }
      }
      return false;
    };

    While.prototype.compileNode = function(o) {
      var answer, body, rvar, set;
      o.indent += TAB;
      set = '';
      body = this.body;
      if (body.isEmpty()) {
        body = this.makeCode('');
      } else {
        if (this.returns) {
          body.makeReturn(rvar = o.scope.freeVariable('results'));
          set = "" + this.tab + rvar + " = [];\n";
        }
        if (this.guard) {
          if (body.expressions.length > 1) {
            body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
          } else {
            if (this.guard) {
              body = Block.wrap([new If(this.guard, body)]);
            }
          }
        }
        body = [].concat(this.makeCode("\n"), body.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab));
      }
      answer = [].concat(this.makeCode(set + this.tab + "while ("), this.condition.compileToFragments(o, LEVEL_PAREN), this.makeCode(") {"), body, this.makeCode("}"));
      if (this.returns) {
        answer.push(this.makeCode("\n" + this.tab + "return " + rvar + ";"));
      }
      return answer;
    };

    return While;

  })(Base);

  exports.Op = Op = (function(_super) {
    var CONVERSIONS, INVERSIONS;

    __extends(Op, _super);

    function Op(op, first, second, flip) {
      if (op === 'in') {
        return new In(first, second);
      }
      if (op === 'do') {
        return this.generateDo(first);
      }
      if (op === 'new') {
        if (first instanceof Call && !first["do"] && !first.isNew) {
          return first.newInstance();
        }
        if (first instanceof Code && first.bound || first["do"]) {
          first = new Parens(first);
        }
      }
      this.operator = CONVERSIONS[op] || op;
      this.first = first;
      this.second = second;
      this.flip = !!flip;
      return this;
    }

    CONVERSIONS = {
      '==': '===',
      '!=': '!==',
      'of': 'in',
      'yieldfrom': 'yield*'
    };

    INVERSIONS = {
      '!==': '===',
      '===': '!=='
    };

    Op.prototype.children = ['first', 'second'];

    Op.prototype.isSimpleNumber = NO;

    Op.prototype.isYield = function() {
      var _ref2;
      return (_ref2 = this.operator) === 'yield' || _ref2 === 'yield*';
    };

    Op.prototype.isUnary = function() {
      return !this.second;
    };

    Op.prototype.isComplex = function() {
      var _ref2;
      return !(this.isUnary() && ((_ref2 = this.operator) === '+' || _ref2 === '-') && this.first instanceof Value && this.first.isSimpleNumber());
    };

    Op.prototype.isChainable = function() {
      var _ref2;
      return (_ref2 = this.operator) === '<' || _ref2 === '>' || _ref2 === '>=' || _ref2 === '<=' || _ref2 === '===' || _ref2 === '!==';
    };

    Op.prototype.invert = function() {
      var allInvertable, curr, fst, op, _ref2;
      if (this.isChainable() && this.first.isChainable()) {
        allInvertable = true;
        curr = this;
        while (curr && curr.operator) {
          allInvertable && (allInvertable = curr.operator in INVERSIONS);
          curr = curr.first;
        }
        if (!allInvertable) {
          return new Parens(this).invert();
        }
        curr = this;
        while (curr && curr.operator) {
          curr.invert = !curr.invert;
          curr.operator = INVERSIONS[curr.operator];
          curr = curr.first;
        }
        return this;
      } else if (op = INVERSIONS[this.operator]) {
        this.operator = op;
        if (this.first.unwrap() instanceof Op) {
          this.first.invert();
        }
        return this;
      } else if (this.second) {
        return new Parens(this).invert();
      } else if (this.operator === '!' && (fst = this.first.unwrap()) instanceof Op && ((_ref2 = fst.operator) === '!' || _ref2 === 'in' || _ref2 === 'instanceof')) {
        return fst;
      } else {
        return new Op('!', this);
      }
    };

    Op.prototype.unfoldSoak = function(o) {
      var _ref2;
      return ((_ref2 = this.operator) === '++' || _ref2 === '--' || _ref2 === 'delete') && unfoldSoak(o, this, 'first');
    };

    Op.prototype.generateDo = function(exp) {
      var call, func, param, passedParams, ref, _i, _len, _ref2;
      passedParams = [];
      func = exp instanceof Assign && (ref = exp.value.unwrap()) instanceof Code ? ref : exp;
      _ref2 = func.params || [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        param = _ref2[_i];
        if (param.value) {
          passedParams.push(param.value);
          delete param.value;
        } else {
          passedParams.push(param);
        }
      }
      call = new Call(exp, passedParams);
      call["do"] = true;
      return call;
    };

    Op.prototype.compileNode = function(o) {
      var answer, isChain, lhs, rhs, _ref2, _ref3;
      isChain = this.isChainable() && this.first.isChainable();
      if (!isChain) {
        this.first.front = this.front;
      }
      if (this.operator === 'delete' && o.scope.check(this.first.unwrapAll().value)) {
        this.error('delete operand may not be argument or var');
      }
      if (((_ref2 = this.operator) === '--' || _ref2 === '++') && (_ref3 = this.first.unwrapAll().value, __indexOf.call(STRICT_PROSCRIBED, _ref3) >= 0)) {
        this.error("cannot increment/decrement \"" + (this.first.unwrapAll().value) + "\"");
      }
      if (this.isYield()) {
        return this.compileYield(o);
      }
      if (this.isUnary()) {
        return this.compileUnary(o);
      }
      if (isChain) {
        return this.compileChain(o);
      }
      switch (this.operator) {
        case '?':
          return this.compileExistence(o);
        case '**':
          return this.compilePower(o);
        case '//':
          return this.compileFloorDivision(o);
        case '%%':
          return this.compileModulo(o);
        default:
          lhs = this.first.compileToFragments(o, LEVEL_OP);
          rhs = this.second.compileToFragments(o, LEVEL_OP);
          answer = [].concat(lhs, this.makeCode(" " + this.operator + " "), rhs);
          if (o.level <= LEVEL_OP) {
            return answer;
          } else {
            return this.wrapInBraces(answer);
          }
      }
    };

    Op.prototype.compileChain = function(o) {
      var fragments, fst, shared, _ref2;
      _ref2 = this.first.second.cache(o), this.first.second = _ref2[0], shared = _ref2[1];
      fst = this.first.compileToFragments(o, LEVEL_OP);
      fragments = fst.concat(this.makeCode(" " + (this.invert ? '&&' : '||') + " "), shared.compileToFragments(o), this.makeCode(" " + this.operator + " "), this.second.compileToFragments(o, LEVEL_OP));
      return this.wrapInBraces(fragments);
    };

    Op.prototype.compileExistence = function(o) {
      var fst, ref;
      if (this.first.isComplex()) {
        ref = new Literal(o.scope.freeVariable('ref'));
        fst = new Parens(new Assign(ref, this.first));
      } else {
        fst = this.first;
        ref = fst;
      }
      return new If(new Existence(fst), ref, {
        type: 'if'
      }).addElse(this.second).compileToFragments(o);
    };

    Op.prototype.compileUnary = function(o) {
      var op, parts, plusMinus;
      parts = [];
      op = this.operator;
      parts.push([this.makeCode(op)]);
      if (op === '!' && this.first instanceof Existence) {
        this.first.negated = !this.first.negated;
        return this.first.compileToFragments(o);
      }
      if (o.level >= LEVEL_ACCESS) {
        return (new Parens(this)).compileToFragments(o);
      }
      plusMinus = op === '+' || op === '-';
      if ((op === 'new' || op === 'typeof' || op === 'delete') || plusMinus && this.first instanceof Op && this.first.operator === op) {
        parts.push([this.makeCode(' ')]);
      }
      if ((plusMinus && this.first instanceof Op) || (op === 'new' && this.first.isStatement(o))) {
        this.first = new Parens(this.first);
      }
      parts.push(this.first.compileToFragments(o, LEVEL_OP));
      if (this.flip) {
        parts.reverse();
      }
      return this.joinFragmentArrays(parts, '');
    };

    Op.prototype.compileYield = function(o) {
      var op, parts;
      parts = [];
      op = this.operator;
      if (o.scope.parent == null) {
        this.error('yield statements must occur within a function generator.');
      }
      if (__indexOf.call(Object.keys(this.first), 'expression') >= 0) {
        if (this.first.expression != null) {
          parts.push(this.first.expression.compileToFragments(o, LEVEL_OP));
        }
      } else {
        parts.push([this.makeCode("(" + op + " ")]);
        parts.push(this.first.compileToFragments(o, LEVEL_OP));
        parts.push([this.makeCode(")")]);
      }
      return this.joinFragmentArrays(parts, '');
    };

    Op.prototype.compilePower = function(o) {
      var pow;
      pow = new Value(new Literal('Math'), [new Access(new Literal('pow'))]);
      return new Call(pow, [this.first, this.second]).compileToFragments(o);
    };

    Op.prototype.compileFloorDivision = function(o) {
      var div, floor;
      floor = new Value(new Literal('Math'), [new Access(new Literal('floor'))]);
      div = new Op('/', this.first, this.second);
      return new Call(floor, [div]).compileToFragments(o);
    };

    Op.prototype.compileModulo = function(o) {
      var mod;
      mod = new Value(new Literal(utility('modulo', o)));
      return new Call(mod, [this.first, this.second]).compileToFragments(o);
    };

    Op.prototype.toString = function(idt) {
      return Op.__super__.toString.call(this, idt, this.constructor.name + ' ' + this.operator);
    };

    return Op;

  })(Base);

  exports.In = In = (function(_super) {
    __extends(In, _super);

    function In(_at_object, _at_array) {
      this.object = _at_object;
      this.array = _at_array;
    }

    In.prototype.children = ['object', 'array'];

    In.prototype.invert = NEGATE;

    In.prototype.compileNode = function(o) {
      var hasSplat, obj, _i, _len, _ref2;
      if (this.array instanceof Value && this.array.isArray() && this.array.base.objects.length) {
        _ref2 = this.array.base.objects;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          obj = _ref2[_i];
          if (!(obj instanceof Splat)) {
            continue;
          }
          hasSplat = true;
          break;
        }
        if (!hasSplat) {
          return this.compileOrTest(o);
        }
      }
      return this.compileLoopTest(o);
    };

    In.prototype.compileOrTest = function(o) {
      var cmp, cnj, i, item, ref, sub, tests, _i, _len, _ref2, _ref3, _ref4;
      _ref2 = this.object.cache(o, LEVEL_OP), sub = _ref2[0], ref = _ref2[1];
      _ref3 = this.negated ? [' !== ', ' && '] : [' === ', ' || '], cmp = _ref3[0], cnj = _ref3[1];
      tests = [];
      _ref4 = this.array.base.objects;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        item = _ref4[i];
        if (i) {
          tests.push(this.makeCode(cnj));
        }
        tests = tests.concat((i ? ref : sub), this.makeCode(cmp), item.compileToFragments(o, LEVEL_ACCESS));
      }
      if (o.level < LEVEL_OP) {
        return tests;
      } else {
        return this.wrapInBraces(tests);
      }
    };

    In.prototype.compileLoopTest = function(o) {
      var fragments, ref, sub, _ref2;
      _ref2 = this.object.cache(o, LEVEL_LIST), sub = _ref2[0], ref = _ref2[1];
      fragments = [].concat(this.makeCode(utility('indexOf', o) + ".call("), this.array.compileToFragments(o, LEVEL_LIST), this.makeCode(", "), ref, this.makeCode(") " + (this.negated ? '< 0' : '>= 0')));
      if (fragmentsToText(sub) === fragmentsToText(ref)) {
        return fragments;
      }
      fragments = sub.concat(this.makeCode(', '), fragments);
      if (o.level < LEVEL_LIST) {
        return fragments;
      } else {
        return this.wrapInBraces(fragments);
      }
    };

    In.prototype.toString = function(idt) {
      return In.__super__.toString.call(this, idt, this.constructor.name + (this.negated ? '!' : ''));
    };

    return In;

  })(Base);

  exports.Try = Try = (function(_super) {
    __extends(Try, _super);

    function Try(_at_attempt, _at_errorVariable, _at_recovery, _at_ensure) {
      this.attempt = _at_attempt;
      this.errorVariable = _at_errorVariable;
      this.recovery = _at_recovery;
      this.ensure = _at_ensure;
    }

    Try.prototype.children = ['attempt', 'recovery', 'ensure'];

    Try.prototype.isStatement = YES;

    Try.prototype.jumps = function(o) {
      var _ref2;
      return this.attempt.jumps(o) || ((_ref2 = this.recovery) != null ? _ref2.jumps(o) : void 0);
    };

    Try.prototype.makeReturn = function(res) {
      if (this.attempt) {
        this.attempt = this.attempt.makeReturn(res);
      }
      if (this.recovery) {
        this.recovery = this.recovery.makeReturn(res);
      }
      return this;
    };

    Try.prototype.compileNode = function(o) {
      var catchPart, ensurePart, placeholder, tryPart;
      o.indent += TAB;
      tryPart = this.attempt.compileToFragments(o, LEVEL_TOP);
      catchPart = this.recovery ? (placeholder = new Literal('_error'), this.errorVariable ? this.recovery.unshift(new Assign(this.errorVariable, placeholder)) : void 0, [].concat(this.makeCode(" catch ("), placeholder.compileToFragments(o), this.makeCode(") {\n"), this.recovery.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab + "}"))) : !(this.ensure || this.recovery) ? [this.makeCode(' catch (_error) {}')] : [];
      ensurePart = this.ensure ? [].concat(this.makeCode(" finally {\n"), this.ensure.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab + "}")) : [];
      return [].concat(this.makeCode(this.tab + "try {\n"), tryPart, this.makeCode("\n" + this.tab + "}"), catchPart, ensurePart);
    };

    return Try;

  })(Base);

  exports.Throw = Throw = (function(_super) {
    __extends(Throw, _super);

    function Throw(_at_expression) {
      this.expression = _at_expression;
    }

    Throw.prototype.children = ['expression'];

    Throw.prototype.isStatement = YES;

    Throw.prototype.jumps = NO;

    Throw.prototype.makeReturn = THIS;

    Throw.prototype.compileNode = function(o) {
      return [].concat(this.makeCode(this.tab + "throw "), this.expression.compileToFragments(o), this.makeCode(";"));
    };

    return Throw;

  })(Base);

  exports.Existence = Existence = (function(_super) {
    __extends(Existence, _super);

    function Existence(_at_expression) {
      this.expression = _at_expression;
    }

    Existence.prototype.children = ['expression'];

    Existence.prototype.invert = NEGATE;

    Existence.prototype.compileNode = function(o) {
      var cmp, cnj, code, _ref2;
      this.expression.front = this.front;
      code = this.expression.compile(o, LEVEL_OP);
      if (IDENTIFIER.test(code) && !o.scope.check(code)) {
        _ref2 = this.negated ? ['===', '||'] : ['!==', '&&'], cmp = _ref2[0], cnj = _ref2[1];
        code = "typeof " + code + " " + cmp + " \"undefined\" " + cnj + " " + code + " " + cmp + " null";
      } else {
        code = code + " " + (this.negated ? '==' : '!=') + " null";
      }
      return [this.makeCode(o.level <= LEVEL_COND ? code : "(" + code + ")")];
    };

    return Existence;

  })(Base);

  exports.Parens = Parens = (function(_super) {
    __extends(Parens, _super);

    function Parens(_at_body) {
      this.body = _at_body;
    }

    Parens.prototype.children = ['body'];

    Parens.prototype.unwrap = function() {
      return this.body;
    };

    Parens.prototype.isComplex = function() {
      return this.body.isComplex();
    };

    Parens.prototype.compileNode = function(o) {
      var bare, expr, fragments;
      expr = this.body.unwrap();
      if (expr instanceof Value && expr.isAtomic()) {
        expr.front = this.front;
        return expr.compileToFragments(o);
      }
      fragments = expr.compileToFragments(o, LEVEL_PAREN);
      bare = o.level < LEVEL_OP && (expr instanceof Op || expr instanceof Call || (expr instanceof For && expr.returns));
      if (bare) {
        return fragments;
      } else {
        return this.wrapInBraces(fragments);
      }
    };

    return Parens;

  })(Base);

  exports.For = For = (function(_super) {
    __extends(For, _super);

    function For(body, source) {
      var _ref2;
      this.source = source.source, this.guard = source.guard, this.step = source.step, this.name = source.name, this.index = source.index;
      this.body = Block.wrap([body]);
      this.own = !!source.own;
      this.object = !!source.object;
      if (this.object) {
        _ref2 = [this.index, this.name], this.name = _ref2[0], this.index = _ref2[1];
      }
      if (this.index instanceof Value) {
        this.index.error('index cannot be a pattern matching expression');
      }
      this.range = this.source instanceof Value && this.source.base instanceof Range && !this.source.properties.length;
      this.pattern = this.name instanceof Value;
      if (this.range && this.index) {
        this.index.error('indexes do not apply to range loops');
      }
      if (this.range && this.pattern) {
        this.name.error('cannot pattern match over range loops');
      }
      if (this.own && !this.object) {
        this.name.error('cannot use own with for-in');
      }
      this.returns = false;
    }

    For.prototype.children = ['body', 'source', 'guard', 'step'];

    For.prototype.compileNode = function(o) {
      var body, bodyFragments, compare, compareDown, declare, declareDown, defPart, defPartFragments, down, forPartFragments, guardPart, idt1, increment, index, ivar, kvar, kvarAssign, lastJumps, lvar, name, namePart, ref, resultPart, returnResult, rvar, scope, source, step, stepNum, stepVar, svar, varPart, _ref2, _ref3;
      body = Block.wrap([this.body]);
      lastJumps = (_ref2 = last(body.expressions)) != null ? _ref2.jumps() : void 0;
      if (lastJumps && lastJumps instanceof Return) {
        this.returns = false;
      }
      source = this.range ? this.source.base : this.source;
      scope = o.scope;
      if (!this.pattern) {
        name = this.name && (this.name.compile(o, LEVEL_LIST));
      }
      index = this.index && (this.index.compile(o, LEVEL_LIST));
      if (name && !this.pattern) {
        scope.find(name);
      }
      if (index) {
        scope.find(index);
      }
      if (this.returns) {
        rvar = scope.freeVariable('results');
      }
      ivar = (this.object && index) || scope.freeVariable('i');
      kvar = (this.range && name) || index || ivar;
      kvarAssign = kvar !== ivar ? kvar + " = " : "";
      if (this.step && !this.range) {
        _ref3 = this.cacheToCodeFragments(this.step.cache(o, LEVEL_LIST)), step = _ref3[0], stepVar = _ref3[1];
        stepNum = stepVar.match(NUMBER);
      }
      if (this.pattern) {
        name = ivar;
      }
      varPart = '';
      guardPart = '';
      defPart = '';
      idt1 = this.tab + TAB;
      if (this.range) {
        forPartFragments = source.compileToFragments(merge(o, {
          index: ivar,
          name: name,
          step: this.step
        }));
      } else {
        svar = this.source.compile(o, LEVEL_LIST);
        if ((name || this.own) && !IDENTIFIER.test(svar)) {
          defPart += "" + this.tab + (ref = scope.freeVariable('ref')) + " = " + svar + ";\n";
          svar = ref;
        }
        if (name && !this.pattern) {
          namePart = name + " = " + svar + "[" + kvar + "]";
        }
        if (!this.object) {
          if (step !== stepVar) {
            defPart += "" + this.tab + step + ";\n";
          }
          if (!(this.step && stepNum && (down = parseNum(stepNum[0]) < 0))) {
            lvar = scope.freeVariable('len');
          }
          declare = "" + kvarAssign + ivar + " = 0, " + lvar + " = " + svar + ".length";
          declareDown = "" + kvarAssign + ivar + " = " + svar + ".length - 1";
          compare = ivar + " < " + lvar;
          compareDown = ivar + " >= 0";
          if (this.step) {
            if (stepNum) {
              if (down) {
                compare = compareDown;
                declare = declareDown;
              }
            } else {
              compare = stepVar + " > 0 ? " + compare + " : " + compareDown;
              declare = "(" + stepVar + " > 0 ? (" + declare + ") : " + declareDown + ")";
            }
            increment = ivar + " += " + stepVar;
          } else {
            increment = "" + (kvar !== ivar ? "++" + ivar : ivar + "++");
          }
          forPartFragments = [this.makeCode(declare + "; " + compare + "; " + kvarAssign + increment)];
        }
      }
      if (this.returns) {
        resultPart = "" + this.tab + rvar + " = [];\n";
        returnResult = "\n" + this.tab + "return " + rvar + ";";
        body.makeReturn(rvar);
      }
      if (this.guard) {
        if (body.expressions.length > 1) {
          body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
        } else {
          if (this.guard) {
            body = Block.wrap([new If(this.guard, body)]);
          }
        }
      }
      if (this.pattern) {
        body.expressions.unshift(new Assign(this.name, new Literal(svar + "[" + kvar + "]")));
      }
      defPartFragments = [].concat(this.makeCode(defPart), this.pluckDirectCall(o, body));
      if (namePart) {
        varPart = "\n" + idt1 + namePart + ";";
      }
      if (this.object) {
        forPartFragments = [this.makeCode(kvar + " in " + svar)];
        if (this.own) {
          guardPart = "\n" + idt1 + "if (!" + (utility('hasProp', o)) + ".call(" + svar + ", " + kvar + ")) continue;";
        }
      }
      bodyFragments = body.compileToFragments(merge(o, {
        indent: idt1
      }), LEVEL_TOP);
      if (bodyFragments && (bodyFragments.length > 0)) {
        bodyFragments = [].concat(this.makeCode("\n"), bodyFragments, this.makeCode("\n"));
      }
      return [].concat(defPartFragments, this.makeCode("" + (resultPart || '') + this.tab + "for ("), forPartFragments, this.makeCode(") {" + guardPart + varPart), bodyFragments, this.makeCode(this.tab + "}" + (returnResult || '')));
    };

    For.prototype.pluckDirectCall = function(o, body) {
      var base, defs, expr, fn, idx, ref, val, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
      defs = [];
      _ref2 = body.expressions;
      for (idx = _i = 0, _len = _ref2.length; _i < _len; idx = ++_i) {
        expr = _ref2[idx];
        expr = expr.unwrapAll();
        if (!(expr instanceof Call)) {
          continue;
        }
        val = (_ref3 = expr.variable) != null ? _ref3.unwrapAll() : void 0;
        if (!((val instanceof Code) || (val instanceof Value && ((_ref4 = val.base) != null ? _ref4.unwrapAll() : void 0) instanceof Code && val.properties.length === 1 && ((_ref5 = (_ref6 = val.properties[0].name) != null ? _ref6.value : void 0) === 'call' || _ref5 === 'apply')))) {
          continue;
        }
        fn = ((_ref7 = val.base) != null ? _ref7.unwrapAll() : void 0) || val;
        ref = new Literal(o.scope.freeVariable('fn'));
        base = new Value(ref);
        if (val.base) {
          _ref8 = [base, val], val.base = _ref8[0], base = _ref8[1];
        }
        body.expressions[idx] = new Call(base, expr.args);
        defs = defs.concat(this.makeCode(this.tab), new Assign(ref, fn).compileToFragments(o, LEVEL_TOP), this.makeCode(';\n'));
      }
      return defs;
    };

    return For;

  })(While);

  exports.Switch = Switch = (function(_super) {
    __extends(Switch, _super);

    function Switch(_at_subject, _at_cases, _at_otherwise) {
      this.subject = _at_subject;
      this.cases = _at_cases;
      this.otherwise = _at_otherwise;
    }

    Switch.prototype.children = ['subject', 'cases', 'otherwise'];

    Switch.prototype.isStatement = YES;

    Switch.prototype.jumps = function(o) {
      var block, conds, jumpNode, _i, _len, _ref2, _ref3, _ref4;
      if (o == null) {
        o = {
          block: true
        };
      }
      _ref2 = this.cases;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        _ref3 = _ref2[_i], conds = _ref3[0], block = _ref3[1];
        if (jumpNode = block.jumps(o)) {
          return jumpNode;
        }
      }
      return (_ref4 = this.otherwise) != null ? _ref4.jumps(o) : void 0;
    };

    Switch.prototype.makeReturn = function(res) {
      var pair, _i, _len, _ref2, _ref3;
      _ref2 = this.cases;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        pair = _ref2[_i];
        pair[1].makeReturn(res);
      }
      if (res) {
        this.otherwise || (this.otherwise = new Block([new Literal('void 0')]));
      }
      if ((_ref3 = this.otherwise) != null) {
        _ref3.makeReturn(res);
      }
      return this;
    };

    Switch.prototype.compileNode = function(o) {
      var block, body, cond, conditions, expr, fragments, i, idt1, idt2, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
      idt1 = o.indent + TAB;
      idt2 = o.indent = idt1 + TAB;
      fragments = [].concat(this.makeCode(this.tab + "switch ("), (this.subject ? this.subject.compileToFragments(o, LEVEL_PAREN) : this.makeCode("false")), this.makeCode(") {\n"));
      _ref2 = this.cases;
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        _ref3 = _ref2[i], conditions = _ref3[0], block = _ref3[1];
        _ref4 = flatten([conditions]);
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          cond = _ref4[_j];
          if (!this.subject) {
            cond = cond.invert();
          }
          fragments = fragments.concat(this.makeCode(idt1 + "case "), cond.compileToFragments(o, LEVEL_PAREN), this.makeCode(":\n"));
        }
        if ((body = block.compileToFragments(o, LEVEL_TOP)).length > 0) {
          fragments = fragments.concat(body, this.makeCode('\n'));
        }
        if (i === this.cases.length - 1 && !this.otherwise) {
          break;
        }
        expr = this.lastNonComment(block.expressions);
        if (expr instanceof Return || (expr instanceof Literal && expr.jumps() && expr.value !== 'debugger')) {
          continue;
        }
        fragments.push(cond.makeCode(idt2 + 'break;\n'));
      }
      if (this.otherwise && this.otherwise.expressions.length) {
        fragments.push.apply(fragments, [this.makeCode(idt1 + "default:\n")].concat(__slice.call(this.otherwise.compileToFragments(o, LEVEL_TOP)), [this.makeCode("\n")]));
      }
      fragments.push(this.makeCode(this.tab + '}'));
      return fragments;
    };

    return Switch;

  })(Base);

  exports.If = If = (function(_super) {
    __extends(If, _super);

    function If(condition, _at_body, options) {
      this.body = _at_body;
      if (options == null) {
        options = {};
      }
      this.condition = options.type === 'unless' ? condition.invert() : condition;
      this.elseBody = null;
      this.isChain = false;
      this.soak = options.soak;
    }

    If.prototype.children = ['condition', 'body', 'elseBody'];

    If.prototype.bodyNode = function() {
      var _ref2;
      return (_ref2 = this.body) != null ? _ref2.unwrap() : void 0;
    };

    If.prototype.elseBodyNode = function() {
      var _ref2;
      return (_ref2 = this.elseBody) != null ? _ref2.unwrap() : void 0;
    };

    If.prototype.addElse = function(elseBody) {
      if (this.isChain) {
        this.elseBodyNode().addElse(elseBody);
      } else {
        this.isChain = elseBody instanceof If;
        this.elseBody = this.ensureBlock(elseBody);
        this.elseBody.updateLocationDataIfMissing(elseBody.locationData);
      }
      return this;
    };

    If.prototype.isStatement = function(o) {
      var _ref2;
      return (o != null ? o.level : void 0) === LEVEL_TOP || this.bodyNode().isStatement(o) || ((_ref2 = this.elseBodyNode()) != null ? _ref2.isStatement(o) : void 0);
    };

    If.prototype.jumps = function(o) {
      var _ref2;
      return this.body.jumps(o) || ((_ref2 = this.elseBody) != null ? _ref2.jumps(o) : void 0);
    };

    If.prototype.compileNode = function(o) {
      if (this.isStatement(o)) {
        return this.compileStatement(o);
      } else {
        return this.compileExpression(o);
      }
    };

    If.prototype.makeReturn = function(res) {
      if (res) {
        this.elseBody || (this.elseBody = new Block([new Literal('void 0')]));
      }
      this.body && (this.body = new Block([this.body.makeReturn(res)]));
      this.elseBody && (this.elseBody = new Block([this.elseBody.makeReturn(res)]));
      return this;
    };

    If.prototype.ensureBlock = function(node) {
      if (node instanceof Block) {
        return node;
      } else {
        return new Block([node]);
      }
    };

    If.prototype.compileStatement = function(o) {
      var answer, body, child, cond, exeq, ifPart, indent;
      child = del(o, 'chainChild');
      exeq = del(o, 'isExistentialEquals');
      if (exeq) {
        return new If(this.condition.invert(), this.elseBodyNode(), {
          type: 'if'
        }).compileToFragments(o);
      }
      indent = o.indent + TAB;
      cond = this.condition.compileToFragments(o, LEVEL_PAREN);
      body = this.ensureBlock(this.body).compileToFragments(merge(o, {
        indent: indent
      }));
      ifPart = [].concat(this.makeCode("if ("), cond, this.makeCode(") {\n"), body, this.makeCode("\n" + this.tab + "}"));
      if (!child) {
        ifPart.unshift(this.makeCode(this.tab));
      }
      if (!this.elseBody) {
        return ifPart;
      }
      answer = ifPart.concat(this.makeCode(' else '));
      if (this.isChain) {
        o.chainChild = true;
        answer = answer.concat(this.elseBody.unwrap().compileToFragments(o, LEVEL_TOP));
      } else {
        answer = answer.concat(this.makeCode("{\n"), this.elseBody.compileToFragments(merge(o, {
          indent: indent
        }), LEVEL_TOP), this.makeCode("\n" + this.tab + "}"));
      }
      return answer;
    };

    If.prototype.compileExpression = function(o) {
      var alt, body, cond, fragments;
      cond = this.condition.compileToFragments(o, LEVEL_COND);
      body = this.bodyNode().compileToFragments(o, LEVEL_LIST);
      alt = this.elseBodyNode() ? this.elseBodyNode().compileToFragments(o, LEVEL_LIST) : [this.makeCode('void 0')];
      fragments = cond.concat(this.makeCode(" ? "), body, this.makeCode(" : "), alt);
      if (o.level >= LEVEL_COND) {
        return this.wrapInBraces(fragments);
      } else {
        return fragments;
      }
    };

    If.prototype.unfoldSoak = function() {
      return this.soak && this;
    };

    return If;

  })(Base);

  UTILITIES = {
    "extends": function(o) {
      return "function(child, parent) { for (var key in parent) { if (" + (utility('hasProp', o)) + ".call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }";
    },
    bind: function() {
      return 'function(fn, me){ return function(){ return fn.apply(me, arguments); }; }';
    },
    indexOf: function() {
      return "[].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; }";
    },
    modulo: function() {
      return "function(a, b) { return (+a % (b = +b) + b) % b; }";
    },
    hasProp: function() {
      return '{}.hasOwnProperty';
    },
    slice: function() {
      return '[].slice';
    }
  };

  LEVEL_TOP = 1;

  LEVEL_PAREN = 2;

  LEVEL_LIST = 3;

  LEVEL_COND = 4;

  LEVEL_OP = 5;

  LEVEL_ACCESS = 6;

  TAB = '  ';

  IDENTIFIER_STR = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*";

  IDENTIFIER = RegExp("^" + IDENTIFIER_STR + "$");

  SIMPLENUM = /^[+-]?\d+$/;

  HEXNUM = /^[+-]?0x[\da-f]+/i;

  NUMBER = /^[+-]?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)$/i;

  METHOD_DEF = RegExp("^(" + IDENTIFIER_STR + ")(\\.prototype)?(?:\\.(" + IDENTIFIER_STR + ")|\\[(\"(?:[^\\\\\"\\r\\n]|\\\\.)*\"|'(?:[^\\\\'\\r\\n]|\\\\.)*')\\]|\\[(0x[\\da-fA-F]+|\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\])$");

  IS_STRING = /^['"]/;

  IS_REGEX = /^\//;

  utility = function(name, o) {
    var ref, root;
    root = o.scope.root;
    if (name in root.utilities) {
      return root.utilities[name];
    } else {
      ref = root.freeVariable("_" + name);
      root.assign(ref, UTILITIES[name](o));
      return root.utilities[name] = ref;
    }
  };

  multident = function(code, tab) {
    code = code.replace(/\n/g, '$&' + tab);
    return code.replace(/\s+$/, '');
  };

  parseNum = function(x) {
    if (x == null) {
      return 0;
    } else if (x.match(HEXNUM)) {
      return parseInt(x, 16);
    } else {
      return parseFloat(x);
    }
  };

  isLiteralArguments = function(node) {
    return node instanceof Literal && node.value === 'arguments' && !node.asKey;
  };

  isLiteralThis = function(node) {
    return (node instanceof Literal && node.value === 'this' && !node.asKey) || (node instanceof Code && node.bound) || (node instanceof Call && node.isSuper);
  };

  unfoldSoak = function(o, parent, name) {
    var ifn;
    if (!(ifn = parent[name].unfoldSoak(o))) {
      return;
    }
    parent[name] = ifn.body;
    ifn.body = new Value(parent);
    return ifn;
  };

}).call(this);

},{"./helpers":10,"./lexer":11,"./scope":16}],13:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,20],$V1=[1,73],$V2=[1,71],$V3=[1,72],$V4=[1,50],$V5=[1,51],$V6=[1,52],$V7=[1,53],$V8=[1,54],$V9=[1,55],$Va=[1,45],$Vb=[1,46],$Vc=[1,27],$Vd=[1,60],$Ve=[1,61],$Vf=[1,70],$Vg=[1,43],$Vh=[1,26],$Vi=[1,58],$Vj=[1,59],$Vk=[1,57],$Vl=[1,38],$Vm=[1,44],$Vn=[1,56],$Vo=[1,65],$Vp=[1,66],$Vq=[1,67],$Vr=[1,68],$Vs=[1,42],$Vt=[1,64],$Vu=[1,29],$Vv=[1,30],$Vw=[1,31],$Vx=[1,32],$Vy=[1,33],$Vz=[1,34],$VA=[1,35],$VB=[1,74],$VC=[1,6,26,102],$VD=[1,84],$VE=[1,77],$VF=[1,76],$VG=[1,75],$VH=[1,78],$VI=[1,79],$VJ=[1,80],$VK=[1,81],$VL=[1,82],$VM=[1,83],$VN=[1,87],$VO=[1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,129,130,135,136,137,138,139,140,141],$VP=[1,93],$VQ=[1,94],$VR=[1,95],$VS=[1,96],$VT=[1,98],$VU=[1,99],$VV=[1,92],$VW=[2,108],$VX=[1,6,25,26,49,54,57,66,67,68,69,71,73,74,78,84,85,86,91,93,102,104,105,106,110,111,126,129,130,135,136,137,138,139,140,141],$VY=[2,75],$VZ=[1,104],$V_=[2,54],$V$=[1,108],$V01=[1,113],$V11=[1,114],$V21=[1,116],$V31=[1,6,25,26,40,49,54,57,66,67,68,69,71,73,74,78,84,85,86,91,93,102,104,105,106,110,111,126,129,130,135,136,137,138,139,140,141],$V41=[2,72],$V51=[1,6,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,129,130,135,136,137,138,139,140,141],$V61=[1,151],$V71=[1,153],$V81=[1,148],$V91=[1,6,25,26,40,49,54,57,66,67,68,69,71,73,74,78,80,84,85,86,91,93,102,104,105,106,110,111,126,129,130,133,134,135,136,137,138,139,140,141,142],$Va1=[2,91],$Vb1=[1,6,25,26,43,49,54,57,66,67,68,69,71,73,74,78,84,85,86,91,93,102,104,105,106,110,111,126,129,130,135,136,137,138,139,140,141],$Vc1=[1,6,25,26,40,43,49,54,57,66,67,68,69,71,73,74,78,80,84,85,86,91,93,102,104,105,106,110,111,117,118,126,129,130,133,134,135,136,137,138,139,140,141,142],$Vd1=[1,199],$Ve1=[1,198],$Vf1=[2,52],$Vg1=[1,209],$Vh1=[6,25,26,49,54],$Vi1=[6,25,26,40,49,54,57],$Vj1=[1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,129,130,136,138,139,140,141],$Vk1=[1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126],$Vl1=[1,228],$Vm1=[2,129],$Vn1=[1,6,25,26,40,49,54,57,66,67,68,69,71,73,74,78,84,85,86,91,93,102,104,105,106,110,111,117,118,126,129,130,135,136,137,138,139,140,141],$Vo1=[1,237],$Vp1=[6,25,26,54,86,91],$Vq1=[1,6,25,26,49,54,57,73,78,86,91,93,102,111,126],$Vr1=[1,6,25,26,49,54,57,73,78,86,91,93,102,105,111,126],$Vs1=[117,118],$Vt1=[54,117,118],$Vu1=[1,248],$Vv1=[6,25,26,54,78],$Vw1=[6,25,26,43,54,78],$Vx1=[1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,129,130,138,139,140,141],$Vy1=[11,28,30,31,33,34,35,36,37,38,45,46,47,51,52,73,76,79,83,88,89,90,96,100,101,104,106,108,110,119,125,127,128,129,130,131,133,134],$Vz1=[2,118],$VA1=[6,25,26],$VB1=[2,53],$VC1=[1,259],$VD1=[1,260],$VE1=[1,6,25,26,49,54,57,73,78,86,91,93,98,99,102,104,105,106,110,111,121,123,126,129,130,135,136,137,138,139,140,141],$VF1=[26,121,123],$VG1=[1,6,26,49,54,57,73,78,86,91,93,102,105,111,126],$VH1=[2,67],$VI1=[1,282],$VJ1=[1,283],$VK1=[1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,121,126,129,130,135,136,137,138,139,140,141],$VL1=[1,6,25,26,49,54,57,73,78,86,91,93,102,104,106,110,111,126],$VM1=[1,294],$VN1=[1,295],$VO1=[6,25,26,54],$VP1=[1,6,25,26,49,54,57,73,78,86,91,93,98,102,104,105,106,110,111,126,129,130,135,136,137,138,139,140,141],$VQ1=[25,54];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Line":5,"TERMINATOR":6,"Expression":7,"Statement":8,"Return":9,"Comment":10,"STATEMENT":11,"Value":12,"Invocation":13,"Code":14,"Operation":15,"Assign":16,"If":17,"Try":18,"While":19,"For":20,"Switch":21,"Class":22,"Throw":23,"Block":24,"INDENT":25,"OUTDENT":26,"Identifier":27,"IDENTIFIER":28,"AlphaNumeric":29,"NUMBER":30,"STRING":31,"Literal":32,"JS":33,"REGEX":34,"DEBUGGER":35,"UNDEFINED":36,"NULL":37,"BOOL":38,"Assignable":39,"=":40,"AssignObj":41,"ObjAssignable":42,":":43,"ThisProperty":44,"RETURN":45,"HERECOMMENT":46,"PARAM_START":47,"ParamList":48,"PARAM_END":49,"FuncGlyph":50,"->":51,"=>":52,"OptComma":53,",":54,"Param":55,"ParamVar":56,"...":57,"Array":58,"Object":59,"Splat":60,"SimpleAssignable":61,"Accessor":62,"Parenthetical":63,"Range":64,"This":65,".":66,"?.":67,"::":68,"?::":69,"Index":70,"INDEX_START":71,"IndexValue":72,"INDEX_END":73,"INDEX_SOAK":74,"Slice":75,"{":76,"AssignList":77,"}":78,"CLASS":79,"EXTENDS":80,"OptFuncExist":81,"Arguments":82,"SUPER":83,"FUNC_EXIST":84,"CALL_START":85,"CALL_END":86,"ArgList":87,"THIS":88,"@":89,"[":90,"]":91,"RangeDots":92,"..":93,"Arg":94,"SimpleArgs":95,"TRY":96,"Catch":97,"FINALLY":98,"CATCH":99,"THROW":100,"(":101,")":102,"WhileSource":103,"WHILE":104,"WHEN":105,"UNTIL":106,"Loop":107,"LOOP":108,"ForBody":109,"FOR":110,"BY":111,"ForStart":112,"ForSource":113,"ForVariables":114,"OWN":115,"ForValue":116,"FORIN":117,"FOROF":118,"SWITCH":119,"Whens":120,"ELSE":121,"When":122,"LEADING_WHEN":123,"IfBlock":124,"IF":125,"POST_IF":126,"UNARY":127,"UNARY_MATH":128,"-":129,"+":130,"YIELD":131,"FROM":132,"--":133,"++":134,"?":135,"MATH":136,"**":137,"SHIFT":138,"COMPARE":139,"LOGIC":140,"RELATION":141,"COMPOUND_ASSIGN":142,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",11:"STATEMENT",25:"INDENT",26:"OUTDENT",28:"IDENTIFIER",30:"NUMBER",31:"STRING",33:"JS",34:"REGEX",35:"DEBUGGER",36:"UNDEFINED",37:"NULL",38:"BOOL",40:"=",43:":",45:"RETURN",46:"HERECOMMENT",47:"PARAM_START",49:"PARAM_END",51:"->",52:"=>",54:",",57:"...",66:".",67:"?.",68:"::",69:"?::",71:"INDEX_START",73:"INDEX_END",74:"INDEX_SOAK",76:"{",78:"}",79:"CLASS",80:"EXTENDS",83:"SUPER",84:"FUNC_EXIST",85:"CALL_START",86:"CALL_END",88:"THIS",89:"@",90:"[",91:"]",93:"..",96:"TRY",98:"FINALLY",99:"CATCH",100:"THROW",101:"(",102:")",104:"WHILE",105:"WHEN",106:"UNTIL",108:"LOOP",110:"FOR",111:"BY",115:"OWN",117:"FORIN",118:"FOROF",119:"SWITCH",121:"ELSE",123:"LEADING_WHEN",125:"IF",126:"POST_IF",127:"UNARY",128:"UNARY_MATH",129:"-",130:"+",131:"YIELD",132:"FROM",133:"--",134:"++",135:"?",136:"MATH",137:"**",138:"SHIFT",139:"COMPARE",140:"LOGIC",141:"RELATION",142:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[4,1],[4,3],[4,2],[5,1],[5,1],[8,1],[8,1],[8,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[24,2],[24,3],[27,1],[29,1],[29,1],[32,1],[32,1],[32,1],[32,1],[32,1],[32,1],[32,1],[16,3],[16,4],[16,5],[41,1],[41,3],[41,5],[41,1],[42,1],[42,1],[42,1],[9,2],[9,1],[10,1],[14,5],[14,2],[50,1],[50,1],[53,0],[53,1],[48,0],[48,1],[48,3],[48,4],[48,6],[55,1],[55,2],[55,3],[55,1],[56,1],[56,1],[56,1],[56,1],[60,2],[61,1],[61,2],[61,2],[61,1],[39,1],[39,1],[39,1],[12,1],[12,1],[12,1],[12,1],[12,1],[62,2],[62,2],[62,2],[62,2],[62,1],[62,1],[70,3],[70,2],[72,1],[72,1],[59,4],[77,0],[77,1],[77,3],[77,4],[77,6],[22,1],[22,2],[22,3],[22,4],[22,2],[22,3],[22,4],[22,5],[13,3],[13,3],[13,1],[13,2],[81,0],[81,1],[82,2],[82,4],[65,1],[65,1],[44,2],[58,2],[58,4],[92,1],[92,1],[64,5],[75,3],[75,2],[75,2],[75,1],[87,1],[87,3],[87,4],[87,4],[87,6],[94,1],[94,1],[94,1],[95,1],[95,3],[18,2],[18,3],[18,4],[18,5],[97,3],[97,3],[97,2],[23,2],[63,3],[63,5],[103,2],[103,4],[103,2],[103,4],[19,2],[19,2],[19,2],[19,1],[107,2],[107,2],[20,2],[20,2],[20,2],[109,2],[109,4],[109,2],[112,2],[112,3],[116,1],[116,1],[116,1],[116,1],[114,1],[114,3],[113,2],[113,2],[113,4],[113,4],[113,4],[113,6],[113,6],[21,5],[21,7],[21,4],[21,6],[120,1],[120,2],[122,3],[122,4],[124,3],[124,5],[17,1],[17,3],[17,3],[17,3],[15,2],[15,2],[15,2],[15,2],[15,2],[15,2],[15,3],[15,2],[15,2],[15,2],[15,2],[15,2],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,5],[15,4],[15,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Block);
break;
case 2:
return this.$ = $$[$0];
break;
case 3:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(yy.Block.wrap([$$[$0]]));
break;
case 4:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].push($$[$0]));
break;
case 5:
this.$ = $$[$0-1];
break;
case 6: case 7: case 8: case 9: case 11: case 12: case 13: case 14: case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 28: case 41: case 42: case 43: case 44: case 52: case 53: case 63: case 64: case 65: case 66: case 71: case 72: case 75: case 79: case 85: case 129: case 130: case 132: case 162: case 163: case 179: case 185:
this.$ = $$[$0];
break;
case 10: case 25: case 26: case 27: case 29: case 30: case 31:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
break;
case 23:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Block);
break;
case 24: case 86:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-1]);
break;
case 32:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Undefined);
break;
case 33:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Null);
break;
case 34:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Bool($$[$0]));
break;
case 35:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign($$[$0-2], $$[$0]));
break;
case 36:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Assign($$[$0-3], $$[$0]));
break;
case 37:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign($$[$0-4], $$[$0-1]));
break;
case 38: case 68: case 73: case 74: case 76: case 77: case 78: case 164: case 165:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
break;
case 39:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign(yy.addLocationDataFn(_$[$0-2])(new yy.Value($$[$0-2])), $$[$0], 'object'));
break;
case 40:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign(yy.addLocationDataFn(_$[$0-4])(new yy.Value($$[$0-4])), $$[$0-1], 'object'));
break;
case 45:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Return($$[$0]));
break;
case 46:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Return);
break;
case 47:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Comment($$[$0]));
break;
case 48:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Code($$[$0-3], $$[$0], $$[$0-1]));
break;
case 49:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Code([], $$[$0], $$[$0-1]));
break;
case 50:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('func');
break;
case 51:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('boundfunc');
break;
case 54: case 91:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([]);
break;
case 55: case 92: case 124: case 166:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
break;
case 56: case 93: case 125:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
break;
case 57: case 94: case 126:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
break;
case 58: case 95: case 128:
this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
break;
case 59:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Param($$[$0]));
break;
case 60:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Param($$[$0-1], null, true));
break;
case 61:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Param($$[$0-2], $$[$0]));
break;
case 62: case 131:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Expansion);
break;
case 67:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Splat($$[$0-1]));
break;
case 69:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].add($$[$0]));
break;
case 70:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Value($$[$0-1], [].concat($$[$0])));
break;
case 80:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Access($$[$0]));
break;
case 81:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Access($$[$0], 'soak'));
break;
case 82:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Access(new yy.Literal('prototype'))), yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))]);
break;
case 83:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Access(new yy.Literal('prototype'), 'soak')), yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))]);
break;
case 84:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Access(new yy.Literal('prototype')));
break;
case 87:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(yy.extend($$[$0], {
          soak: true
        }));
break;
case 88:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Index($$[$0]));
break;
case 89:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Slice($$[$0]));
break;
case 90:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Obj($$[$0-2], $$[$0-3].generated));
break;
case 96:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Class);
break;
case 97:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Class(null, null, $$[$0]));
break;
case 98:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Class(null, $$[$0]));
break;
case 99:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Class(null, $$[$0-1], $$[$0]));
break;
case 100:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Class($$[$0]));
break;
case 101:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Class($$[$0-1], null, $$[$0]));
break;
case 102:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Class($$[$0-2], $$[$0]));
break;
case 103:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Class($$[$0-3], $$[$0-1], $$[$0]));
break;
case 104: case 105:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Call($$[$0-2], $$[$0], $$[$0-1]));
break;
case 106:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]));
break;
case 107:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Call('super', $$[$0]));
break;
case 108:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(false);
break;
case 109:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(true);
break;
case 110:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([]);
break;
case 111: case 127:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-2]);
break;
case 112: case 113:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value(new yy.Literal('this')));
break;
case 114:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Value(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('this')), [yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))], 'this'));
break;
case 115:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Arr([]));
break;
case 116:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Arr($$[$0-2]));
break;
case 117:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('inclusive');
break;
case 118:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('exclusive');
break;
case 119:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]));
break;
case 120:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Range($$[$0-2], $$[$0], $$[$0-1]));
break;
case 121:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Range($$[$0-1], null, $$[$0]));
break;
case 122:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Range(null, $$[$0], $$[$0-1]));
break;
case 123:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Range(null, null, $$[$0]));
break;
case 133:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([].concat($$[$0-2], $$[$0]));
break;
case 134:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Try($$[$0]));
break;
case 135:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]));
break;
case 136:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Try($$[$0-2], null, null, $$[$0]));
break;
case 137:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]));
break;
case 138:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([$$[$0-1], $$[$0]]);
break;
case 139:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Value($$[$0-1])), $$[$0]]);
break;
case 140:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([null, $$[$0]]);
break;
case 141:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Throw($$[$0]));
break;
case 142:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Parens($$[$0-1]));
break;
case 143:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Parens($$[$0-2]));
break;
case 144:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While($$[$0]));
break;
case 145:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.While($$[$0-2], {
          guard: $$[$0]
        }));
break;
case 146:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While($$[$0], {
          invert: true
        }));
break;
case 147:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        }));
break;
case 148:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].addBody($$[$0]));
break;
case 149: case 150:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0].addBody(yy.addLocationDataFn(_$[$0-1])(yy.Block.wrap([$$[$0-1]]))));
break;
case 151:
this.$ = yy.addLocationDataFn(_$[$0], _$[$0])($$[$0]);
break;
case 152:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('true'))).addBody($$[$0]));
break;
case 153:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('true'))).addBody(yy.addLocationDataFn(_$[$0])(yy.Block.wrap([$$[$0]]))));
break;
case 154: case 155:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0-1], $$[$0]));
break;
case 156:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0], $$[$0-1]));
break;
case 157:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
          source: yy.addLocationDataFn(_$[$0])(new yy.Value($$[$0]))
        });
break;
case 158:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
          source: yy.addLocationDataFn(_$[$0-2])(new yy.Value($$[$0-2])),
          step: $$[$0]
        });
break;
case 159:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])((function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }()));
break;
case 160:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0]);
break;
case 161:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])((function () {
        $$[$0].own = true;
        return $$[$0];
      }()));
break;
case 167:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([$$[$0-2], $$[$0]]);
break;
case 168:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
          source: $$[$0]
        });
break;
case 169:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
          source: $$[$0],
          object: true
        });
break;
case 170:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
          source: $$[$0-2],
          guard: $$[$0]
        });
break;
case 171:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        });
break;
case 172:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
          source: $$[$0-2],
          step: $$[$0]
        });
break;
case 173:
this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])({
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        });
break;
case 174:
this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])({
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        });
break;
case 175:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Switch($$[$0-3], $$[$0-1]));
break;
case 176:
this.$ = yy.addLocationDataFn(_$[$0-6], _$[$0])(new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]));
break;
case 177:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Switch(null, $$[$0-1]));
break;
case 178:
this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])(new yy.Switch(null, $$[$0-3], $$[$0-1]));
break;
case 180:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].concat($$[$0]));
break;
case 181:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([[$$[$0-1], $$[$0]]]);
break;
case 182:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])([[$$[$0-2], $$[$0-1]]]);
break;
case 183:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 184:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])($$[$0-4].addElse(yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }))));
break;
case 186:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].addElse($$[$0]));
break;
case 187: case 188:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0], yy.addLocationDataFn(_$[$0-2])(yy.Block.wrap([$$[$0-2]])), {
          type: $$[$0-1],
          statement: true
        }));
break;
case 189: case 190: case 193: case 194:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op($$[$0-1], $$[$0]));
break;
case 191:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('-', $$[$0]));
break;
case 192:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('+', $$[$0]));
break;
case 195:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-2].concat($$[$0-1]), $$[$0]));
break;
case 196:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('--', $$[$0]));
break;
case 197:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('++', $$[$0]));
break;
case 198:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('--', $$[$0-1], null, true));
break;
case 199:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('++', $$[$0-1], null, true));
break;
case 200:
this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Existence($$[$0-1]));
break;
case 201:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op('+', $$[$0-2], $$[$0]));
break;
case 202:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op('-', $$[$0-2], $$[$0]));
break;
case 203: case 204: case 205: case 206: case 207:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
break;
case 208:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])((function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }()));
break;
case 209:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign($$[$0-2], $$[$0], $$[$0-1]));
break;
case 210:
this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]));
break;
case 211:
this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Assign($$[$0-3], $$[$0], $$[$0-2]));
break;
case 212:
this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Extends($$[$0-2], $$[$0]));
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:5,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{1:[3]},{1:[2,2],6:$VB},o($VC,[2,3]),o($VC,[2,6],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VC,[2,7],{112:69,103:88,109:89,104:$Vo,106:$Vp,110:$Vr,126:$VN}),o($VO,[2,11],{81:90,62:91,70:97,66:$VP,67:$VQ,68:$VR,69:$VS,71:$VT,74:$VU,84:$VV,85:$VW}),o($VO,[2,12],{70:97,81:100,62:101,66:$VP,67:$VQ,68:$VR,69:$VS,71:$VT,74:$VU,84:$VV,85:$VW}),o($VO,[2,13]),o($VO,[2,14]),o($VO,[2,15]),o($VO,[2,16]),o($VO,[2,17]),o($VO,[2,18]),o($VO,[2,19]),o($VO,[2,20]),o($VO,[2,21]),o($VO,[2,22]),o($VO,[2,8]),o($VO,[2,9]),o($VO,[2,10]),o($VX,$VY,{40:[1,102]}),o($VX,[2,76]),o($VX,[2,77]),o($VX,[2,78]),o($VX,[2,79]),o([1,6,25,26,49,54,57,66,67,68,69,71,73,74,78,84,86,91,93,102,104,105,106,110,111,126,129,130,135,136,137,138,139,140,141],[2,106],{82:103,85:$VZ}),o([6,25,49,54],$V_,{48:105,55:106,56:107,27:109,44:110,58:111,59:112,28:$V1,57:$V$,76:$Vf,89:$V01,90:$V11}),{24:115,25:$V21},{7:117,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:119,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:120,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:121,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:123,8:122,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,132:[1,124],133:$Vz,134:$VA},{12:126,13:127,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:128,44:63,58:47,59:48,61:125,63:23,64:24,65:25,76:$Vf,83:$Vh,88:$Vi,89:$Vj,90:$Vk,101:$Vn},{12:126,13:127,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:128,44:63,58:47,59:48,61:129,63:23,64:24,65:25,76:$Vf,83:$Vh,88:$Vi,89:$Vj,90:$Vk,101:$Vn},o($V31,$V41,{80:[1,133],133:[1,130],134:[1,131],142:[1,132]}),o($VO,[2,185],{121:[1,134]}),{24:135,25:$V21},{24:136,25:$V21},o($VO,[2,151]),{24:137,25:$V21},{7:138,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,139],27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($V51,[2,96],{32:22,63:23,64:24,65:25,58:47,59:48,29:49,27:62,44:63,12:126,13:127,39:128,24:140,61:142,25:$V21,28:$V1,30:$V2,31:$V3,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,76:$Vf,80:[1,141],83:$Vh,88:$Vi,89:$Vj,90:$Vk,101:$Vn}),{7:143,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,135,136,137,138,139,140,141],[2,46],{12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,9:18,10:19,39:21,32:22,63:23,64:24,65:25,50:28,61:36,124:37,103:39,107:40,109:41,58:47,59:48,29:49,27:62,44:63,112:69,8:118,7:144,11:$V0,28:$V1,30:$V2,31:$V3,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,45:$Va,46:$Vb,47:$Vc,51:$Vd,52:$Ve,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,108:$Vq,119:$Vs,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA}),o($VO,[2,47]),o($V31,[2,73]),o($V31,[2,74]),o($VX,[2,28]),o($VX,[2,29]),o($VX,[2,30]),o($VX,[2,31]),o($VX,[2,32]),o($VX,[2,33]),o($VX,[2,34]),{4:145,5:3,7:4,8:5,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,146],27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:147,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:$V61,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,57:$V71,58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,87:149,88:$Vi,89:$Vj,90:$Vk,91:$V81,94:150,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VX,[2,112]),o($VX,[2,113],{27:154,28:$V1}),{25:[2,50]},{25:[2,51]},o($V91,[2,68]),o($V91,[2,71]),{7:155,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:156,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:157,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:159,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:158,25:$V21,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{27:164,28:$V1,44:165,58:166,59:167,64:160,76:$Vf,89:$V01,90:$Vk,114:161,115:[1,162],116:163},{113:168,117:[1,169],118:[1,170]},o([6,25,54,78],$Va1,{77:171,41:172,42:173,10:174,27:175,29:176,44:177,28:$V1,30:$V2,31:$V3,46:$Vb,89:$V01}),o($Vb1,[2,26]),o($Vb1,[2,27]),o($Vc1,[2,25]),o($VC,[2,5],{7:4,8:5,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,9:18,10:19,39:21,32:22,63:23,64:24,65:25,50:28,61:36,124:37,103:39,107:40,109:41,58:47,59:48,29:49,27:62,44:63,112:69,5:178,11:$V0,28:$V1,30:$V2,31:$V3,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,45:$Va,46:$Vb,47:$Vc,51:$Vd,52:$Ve,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,104:$Vo,106:$Vp,108:$Vq,110:$Vr,119:$Vs,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA}),o($VO,[2,200]),{7:179,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:180,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:181,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:182,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:183,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:184,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:185,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:186,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:187,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VO,[2,150]),o($VO,[2,155]),{7:188,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VO,[2,149]),o($VO,[2,154]),{82:189,85:$VZ},o($V91,[2,69]),{85:[2,109]},{27:190,28:$V1},{27:191,28:$V1},o($V91,[2,84],{27:192,28:$V1}),{27:193,28:$V1},o($V91,[2,85]),{7:195,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,57:$Vd1,58:47,59:48,61:36,63:23,64:24,65:25,72:194,75:196,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,92:197,93:$Ve1,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{70:200,71:$VT,74:$VU},{82:201,85:$VZ},o($V91,[2,70]),{6:[1,203],7:202,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,204],27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VX,[2,107]),{7:207,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:$V61,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,57:$V71,58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,86:[1,205],87:206,88:$Vi,89:$Vj,90:$Vk,94:150,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o([6,25],$Vf1,{53:210,49:[1,208],54:$Vg1}),o($Vh1,[2,55]),o($Vh1,[2,59],{40:[1,212],57:[1,211]}),o($Vh1,[2,62]),o($Vi1,[2,63]),o($Vi1,[2,64]),o($Vi1,[2,65]),o($Vi1,[2,66]),{27:154,28:$V1},{7:207,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:$V61,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,57:$V71,58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,87:149,88:$Vi,89:$Vj,90:$Vk,91:$V81,94:150,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VO,[2,49]),{4:214,5:3,7:4,8:5,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,26:[1,213],27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,129,130,136,137,138,139,140,141],[2,189],{112:69,103:85,109:86,135:$VG}),{103:88,104:$Vo,106:$Vp,109:89,110:$Vr,112:69,126:$VN},o($Vj1,[2,190],{112:69,103:85,109:86,135:$VG,137:$VI}),o($Vj1,[2,191],{112:69,103:85,109:86,135:$VG,137:$VI}),o($Vj1,[2,192],{112:69,103:85,109:86,135:$VG,137:$VI}),o($VO,[2,193],{112:69,103:88,109:89}),o($Vk1,[2,194],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{7:215,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VO,[2,196],{66:$V41,67:$V41,68:$V41,69:$V41,71:$V41,74:$V41,84:$V41,85:$V41}),{62:91,66:$VP,67:$VQ,68:$VR,69:$VS,70:97,71:$VT,74:$VU,81:90,84:$VV,85:$VW},{62:101,66:$VP,67:$VQ,68:$VR,69:$VS,70:97,71:$VT,74:$VU,81:100,84:$VV,85:$VW},o([66,67,68,69,71,74,84,85],$VY),o($VO,[2,197],{66:$V41,67:$V41,68:$V41,69:$V41,71:$V41,74:$V41,84:$V41,85:$V41}),o($VO,[2,198]),o($VO,[2,199]),{6:[1,218],7:216,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,217],27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:219,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{24:220,25:$V21,125:[1,221]},o($VO,[2,134],{97:222,98:[1,223],99:[1,224]}),o($VO,[2,148]),o($VO,[2,156]),{25:[1,225],103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},{120:226,122:227,123:$Vl1},o($VO,[2,97]),{7:229,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($V51,[2,100],{24:230,25:$V21,66:$V41,67:$V41,68:$V41,69:$V41,71:$V41,74:$V41,84:$V41,85:$V41,80:[1,231]}),o($Vk1,[2,141],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vk1,[2,45],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{6:$VB,102:[1,232]},{4:233,5:3,7:4,8:5,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o([6,25,54,91],$Vm1,{112:69,103:85,109:86,92:234,57:[1,235],93:$Ve1,104:$Vo,106:$Vp,110:$Vr,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vn1,[2,115]),o([6,25,91],$Vf1,{53:236,54:$Vo1}),o($Vp1,[2,124]),{7:207,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:$V61,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,57:$V71,58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,87:238,88:$Vi,89:$Vj,90:$Vk,94:150,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($Vp1,[2,130]),o($Vp1,[2,131]),o($Vc1,[2,114]),{24:239,25:$V21,103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},o($Vq1,[2,144],{112:69,103:85,109:86,104:$Vo,105:[1,240],106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vq1,[2,146],{112:69,103:85,109:86,104:$Vo,105:[1,241],106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VO,[2,152]),o($Vr1,[2,153],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,126,129,130,135,136,137,138,139,140,141],[2,157],{111:[1,242]}),o($Vs1,[2,160]),{27:164,28:$V1,44:165,58:166,59:167,76:$Vf,89:$V01,90:$V11,114:243,116:163},o($Vs1,[2,166],{54:[1,244]}),o($Vt1,[2,162]),o($Vt1,[2,163]),o($Vt1,[2,164]),o($Vt1,[2,165]),o($VO,[2,159]),{7:245,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:246,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o([6,25,78],$Vf1,{53:247,54:$Vu1}),o($Vv1,[2,92]),o($Vv1,[2,38],{43:[1,249]}),o($Vv1,[2,41]),o($Vw1,[2,42]),o($Vw1,[2,43]),o($Vw1,[2,44]),o($VC,[2,4]),o($Vx1,[2,201],{112:69,103:85,109:86,135:$VG,136:$VH,137:$VI}),o($Vx1,[2,202],{112:69,103:85,109:86,135:$VG,136:$VH,137:$VI}),o($Vj1,[2,203],{112:69,103:85,109:86,135:$VG,137:$VI}),o($Vj1,[2,204],{112:69,103:85,109:86,135:$VG,137:$VI}),o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,138,139,140,141],[2,205],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI}),o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,139,140],[2,206],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,141:$VM}),o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,140],[2,207],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,141:$VM}),o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,111,126,139,140,141],[2,208],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ}),o($Vr1,[2,188],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vr1,[2,187],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VX,[2,104]),o($V91,[2,80]),o($V91,[2,81]),o($V91,[2,82]),o($V91,[2,83]),{73:[1,250]},{57:$Vd1,73:[2,88],92:251,93:$Ve1,103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},{73:[2,89]},{7:252,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,73:[2,123],76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($Vy1,[2,117]),o($Vy1,$Vz1),o($V91,[2,87]),o($VX,[2,105]),o($Vk1,[2,35],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{7:253,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:254,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VX,[2,110]),o([6,25,86],$Vf1,{53:255,54:$Vo1}),o($Vp1,$Vm1,{112:69,103:85,109:86,57:[1,256],104:$Vo,106:$Vp,110:$Vr,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{50:257,51:$Vd,52:$Ve},o($VA1,$VB1,{56:107,27:109,44:110,58:111,59:112,55:258,28:$V1,57:$V$,76:$Vf,89:$V01,90:$V11}),{6:$VC1,25:$VD1},o($Vh1,[2,60]),{7:261,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VE1,[2,23]),{6:$VB,26:[1,262]},o($Vk1,[2,195],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vk1,[2,209],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{7:263,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:264,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($Vk1,[2,212],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VO,[2,186]),{7:265,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VO,[2,135],{98:[1,266]}),{24:267,25:$V21},{24:270,25:$V21,27:268,28:$V1,59:269,76:$Vf},{120:271,122:227,123:$Vl1},{26:[1,272],121:[1,273],122:274,123:$Vl1},o($VF1,[2,179]),{7:276,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,95:275,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VG1,[2,98],{112:69,103:85,109:86,24:277,25:$V21,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VO,[2,101]),{7:278,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VX,[2,142]),{6:$VB,26:[1,279]},{7:280,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o([11,28,30,31,33,34,35,36,37,38,45,46,47,51,52,76,79,83,88,89,90,96,100,101,104,106,108,110,119,125,127,128,129,130,131,133,134],$Vz1,{6:$VH1,25:$VH1,54:$VH1,91:$VH1}),{6:$VI1,25:$VJ1,91:[1,281]},o([6,25,26,86,91],$VB1,{12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,9:18,10:19,39:21,32:22,63:23,64:24,65:25,50:28,61:36,124:37,103:39,107:40,109:41,58:47,59:48,29:49,27:62,44:63,112:69,8:118,60:152,7:207,94:284,11:$V0,28:$V1,30:$V2,31:$V3,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,45:$Va,46:$Vb,47:$Vc,51:$Vd,52:$Ve,57:$V71,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,104:$Vo,106:$Vp,108:$Vq,110:$Vr,119:$Vs,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA}),o($VA1,$Vf1,{53:285,54:$Vo1}),o($VK1,[2,183]),{7:286,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:287,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:288,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($Vs1,[2,161]),{27:164,28:$V1,44:165,58:166,59:167,76:$Vf,89:$V01,90:$V11,116:289},o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,106,110,126],[2,168],{112:69,103:85,109:86,105:[1,290],111:[1,291],129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VL1,[2,169],{112:69,103:85,109:86,105:[1,292],129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{6:$VM1,25:$VN1,78:[1,293]},o([6,25,26,78],$VB1,{42:173,10:174,27:175,29:176,44:177,41:296,28:$V1,30:$V2,31:$V3,46:$Vb,89:$V01}),{7:297,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,298],27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($V91,[2,86]),{7:299,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,73:[2,121],76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{73:[2,122],103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},o($Vk1,[2,36],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{26:[1,300],103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},{6:$VI1,25:$VJ1,86:[1,301]},o($Vp1,$VH1),{24:302,25:$V21},o($Vh1,[2,56]),{27:109,28:$V1,44:110,55:303,56:107,57:$V$,58:111,59:112,76:$Vf,89:$V01,90:$V11},o($VO1,$V_,{55:106,56:107,27:109,44:110,58:111,59:112,48:304,28:$V1,57:$V$,76:$Vf,89:$V01,90:$V11}),o($Vh1,[2,61],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VE1,[2,24]),{26:[1,305],103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},o($Vk1,[2,211],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{24:306,25:$V21,103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},{24:307,25:$V21},o($VO,[2,136]),{24:308,25:$V21},{24:309,25:$V21},o($VP1,[2,140]),{26:[1,310],121:[1,311],122:274,123:$Vl1},o($VO,[2,177]),{24:312,25:$V21},o($VF1,[2,180]),{24:313,25:$V21,54:[1,314]},o($VQ1,[2,132],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VO,[2,99]),o($VG1,[2,102],{112:69,103:85,109:86,24:315,25:$V21,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{102:[1,316]},{91:[1,317],103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},o($Vn1,[2,116]),{7:207,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,57:$V71,58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,94:318,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:207,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:$V61,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,57:$V71,58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,87:319,88:$Vi,89:$Vj,90:$Vk,94:150,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($Vp1,[2,125]),{6:$VI1,25:$VJ1,26:[1,320]},o($Vr1,[2,145],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vr1,[2,147],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vr1,[2,158],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vs1,[2,167]),{7:321,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:322,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:323,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($Vn1,[2,90]),{10:174,27:175,28:$V1,29:176,30:$V2,31:$V3,41:324,42:173,44:177,46:$Vb,89:$V01},o($VO1,$Va1,{41:172,42:173,10:174,27:175,29:176,44:177,77:325,28:$V1,30:$V2,31:$V3,46:$Vb,89:$V01}),o($Vv1,[2,93]),o($Vv1,[2,39],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{7:326,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{73:[2,120],103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},o($VO,[2,37]),o($VX,[2,111]),o($VO,[2,48]),o($Vh1,[2,57]),o($VA1,$Vf1,{53:327,54:$Vg1}),o($VO,[2,210]),o($VK1,[2,184]),o($VO,[2,137]),o($VP1,[2,138]),o($VP1,[2,139]),o($VO,[2,175]),{24:328,25:$V21},{26:[1,329]},o($VF1,[2,181],{6:[1,330]}),{7:331,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},o($VO,[2,103]),o($VX,[2,143]),o($VX,[2,119]),o($Vp1,[2,126]),o($VA1,$Vf1,{53:332,54:$Vo1}),o($Vp1,[2,127]),o([1,6,25,26,49,54,57,73,78,86,91,93,102,104,105,106,110,126],[2,170],{112:69,103:85,109:86,111:[1,333],129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($VL1,[2,172],{112:69,103:85,109:86,105:[1,334],129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vk1,[2,171],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vv1,[2,94]),o($VA1,$Vf1,{53:335,54:$Vu1}),{26:[1,336],103:85,104:$Vo,106:$Vp,109:86,110:$Vr,112:69,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM},{6:$VC1,25:$VD1,26:[1,337]},{26:[1,338]},o($VO,[2,178]),o($VF1,[2,182]),o($VQ1,[2,133],{112:69,103:85,109:86,104:$Vo,106:$Vp,110:$Vr,126:$VD,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),{6:$VI1,25:$VJ1,26:[1,339]},{7:340,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{7:341,8:118,9:18,10:19,11:$V0,12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:$V1,29:49,30:$V2,31:$V3,32:22,33:$V4,34:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:21,44:63,45:$Va,46:$Vb,47:$Vc,50:28,51:$Vd,52:$Ve,58:47,59:48,61:36,63:23,64:24,65:25,76:$Vf,79:$Vg,83:$Vh,88:$Vi,89:$Vj,90:$Vk,96:$Vl,100:$Vm,101:$Vn,103:39,104:$Vo,106:$Vp,107:40,108:$Vq,109:41,110:$Vr,112:69,119:$Vs,124:37,125:$Vt,127:$Vu,128:$Vv,129:$Vw,130:$Vx,131:$Vy,133:$Vz,134:$VA},{6:$VM1,25:$VN1,26:[1,342]},o($Vv1,[2,40]),o($Vh1,[2,58]),o($VO,[2,176]),o($Vp1,[2,128]),o($Vk1,[2,173],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vk1,[2,174],{112:69,103:85,109:86,129:$VE,130:$VF,135:$VG,136:$VH,137:$VI,138:$VJ,139:$VK,140:$VL,141:$VM}),o($Vv1,[2,95])],
defaultActions: {60:[2,50],61:[2,51],92:[2,109],196:[2,89]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require("IrXUsu"))
},{"IrXUsu":20,"fs":18,"path":19}],14:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
(function() {
  var CoffeeScript, Module, binary, child_process, ext, findExtension, fork, helpers, loadFile, path, _i, _len, _ref;

  CoffeeScript = require('./coffee-script');

  child_process = require('child_process');

  helpers = require('./helpers');

  path = require('path');

  loadFile = function(module, filename) {
    var answer;
    answer = CoffeeScript._compileFile(filename, false);
    return module._compile(answer, filename);
  };

  if (require.extensions) {
    _ref = CoffeeScript.FILE_EXTENSIONS;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ext = _ref[_i];
      require.extensions[ext] = loadFile;
    }
    Module = require('module');
    findExtension = function(filename) {
      var curExtension, extensions;
      extensions = path.basename(filename).split('.');
      if (extensions[0] === '') {
        extensions.shift();
      }
      while (extensions.shift()) {
        curExtension = '.' + extensions.join('.');
        if (Module._extensions[curExtension]) {
          return curExtension;
        }
      }
      return '.js';
    };
    Module.prototype.load = function(filename) {
      var extension;
      this.filename = filename;
      this.paths = Module._nodeModulePaths(path.dirname(filename));
      extension = findExtension(filename);
      Module._extensions[extension](this, filename);
      return this.loaded = true;
    };
  }

  if (child_process) {
    fork = child_process.fork;
    binary = require.resolve('../../bin/coffee');
    child_process.fork = function(path, args, options) {
      if (helpers.isCoffee(path)) {
        if (!Array.isArray(args)) {
          options = args || {};
          args = [];
        }
        args = [path].concat(args);
        path = binary;
      }
      return fork(path, args, options);
    };
  }

}).call(this);

},{"./coffee-script":9,"./helpers":10,"child_process":18,"module":18,"path":19}],15:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
(function() {
  var BALANCED_PAIRS, CALL_CLOSERS, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, SINGLE_CLOSERS, SINGLE_LINERS, generate, left, rite, _i, _len, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  generate = function(tag, value, origin) {
    var tok;
    tok = [tag, value];
    tok.generated = true;
    if (origin) {
      tok.origin = origin;
    }
    return tok;
  };

  exports.Rewriter = (function() {
    function Rewriter() {}

    Rewriter.prototype.rewrite = function(_at_tokens) {
      this.tokens = _at_tokens;
      this.removeLeadingNewlines();
      this.closeOpenCalls();
      this.closeOpenIndexes();
      this.normalizeLines();
      this.tagPostfixConditionals();
      this.addImplicitBracesAndParens();
      this.addLocationDataToGeneratedTokens();
      return this.tokens;
    };

    Rewriter.prototype.scanTokens = function(block) {
      var i, token, tokens;
      tokens = this.tokens;
      i = 0;
      while (token = tokens[i]) {
        i += block.call(this, token, i, tokens);
      }
      return true;
    };

    Rewriter.prototype.detectEnd = function(i, condition, action) {
      var levels, token, tokens, _ref, _ref1;
      tokens = this.tokens;
      levels = 0;
      while (token = tokens[i]) {
        if (levels === 0 && condition.call(this, token, i)) {
          return action.call(this, token, i);
        }
        if (!token || levels < 0) {
          return action.call(this, token, i - 1);
        }
        if (_ref = token[0], __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          levels += 1;
        } else if (_ref1 = token[0], __indexOf.call(EXPRESSION_END, _ref1) >= 0) {
          levels -= 1;
        }
        i += 1;
      }
      return i - 1;
    };

    Rewriter.prototype.removeLeadingNewlines = function() {
      var i, tag, _i, _len, _ref;
      _ref = this.tokens;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        tag = _ref[i][0];
        if (tag !== 'TERMINATOR') {
          break;
        }
      }
      if (i) {
        return this.tokens.splice(0, i);
      }
    };

    Rewriter.prototype.closeOpenCalls = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return ((_ref = token[0]) === ')' || _ref === 'CALL_END') || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
      };
      action = function(token, i) {
        return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'CALL_START') {
          this.detectEnd(i + 1, condition, action);
        }
        return 1;
      });
    };

    Rewriter.prototype.closeOpenIndexes = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === ']' || _ref === 'INDEX_END';
      };
      action = function(token, i) {
        return token[0] = 'INDEX_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'INDEX_START') {
          this.detectEnd(i + 1, condition, action);
        }
        return 1;
      });
    };

    Rewriter.prototype.matchTags = function() {
      var fuzz, i, j, pattern, _i, _ref, _ref1;
      i = arguments[0], pattern = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      fuzz = 0;
      for (j = _i = 0, _ref = pattern.length; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
        while (this.tag(i + j + fuzz) === 'HERECOMMENT') {
          fuzz += 2;
        }
        if (pattern[j] == null) {
          continue;
        }
        if (typeof pattern[j] === 'string') {
          pattern[j] = [pattern[j]];
        }
        if (_ref1 = this.tag(i + j + fuzz), __indexOf.call(pattern[j], _ref1) < 0) {
          return false;
        }
      }
      return true;
    };

    Rewriter.prototype.looksObjectish = function(j) {
      return this.matchTags(j, '@', null, ':') || this.matchTags(j, null, ':');
    };

    Rewriter.prototype.findTagsBackwards = function(i, tags) {
      var backStack, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      backStack = [];
      while (i >= 0 && (backStack.length || (_ref2 = this.tag(i), __indexOf.call(tags, _ref2) < 0) && ((_ref3 = this.tag(i), __indexOf.call(EXPRESSION_START, _ref3) < 0) || this.tokens[i].generated) && (_ref4 = this.tag(i), __indexOf.call(LINEBREAKS, _ref4) < 0))) {
        if (_ref = this.tag(i), __indexOf.call(EXPRESSION_END, _ref) >= 0) {
          backStack.push(this.tag(i));
        }
        if ((_ref1 = this.tag(i), __indexOf.call(EXPRESSION_START, _ref1) >= 0) && backStack.length) {
          backStack.pop();
        }
        i -= 1;
      }
      return _ref5 = this.tag(i), __indexOf.call(tags, _ref5) >= 0;
    };

    Rewriter.prototype.addImplicitBracesAndParens = function() {
      var stack;
      stack = [];
      return this.scanTokens(function(token, i, tokens) {
        var endImplicitCall, endImplicitObject, forward, inImplicit, inImplicitCall, inImplicitControl, inImplicitObject, newLine, nextTag, offset, prevTag, prevToken, s, sameLine, stackIdx, stackTag, stackTop, startIdx, startImplicitCall, startImplicitObject, startsLine, tag, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        tag = token[0];
        prevTag = (prevToken = i > 0 ? tokens[i - 1] : [])[0];
        nextTag = (i < tokens.length - 1 ? tokens[i + 1] : [])[0];
        stackTop = function() {
          return stack[stack.length - 1];
        };
        startIdx = i;
        forward = function(n) {
          return i - startIdx + n;
        };
        inImplicit = function() {
          var _ref, _ref1;
          return (_ref = stackTop()) != null ? (_ref1 = _ref[2]) != null ? _ref1.ours : void 0 : void 0;
        };
        inImplicitCall = function() {
          var _ref;
          return inImplicit() && ((_ref = stackTop()) != null ? _ref[0] : void 0) === '(';
        };
        inImplicitObject = function() {
          var _ref;
          return inImplicit() && ((_ref = stackTop()) != null ? _ref[0] : void 0) === '{';
        };
        inImplicitControl = function() {
          var _ref;
          return inImplicit && ((_ref = stackTop()) != null ? _ref[0] : void 0) === 'CONTROL';
        };
        startImplicitCall = function(j) {
          var idx;
          idx = j != null ? j : i;
          stack.push([
            '(', idx, {
              ours: true
            }
          ]);
          tokens.splice(idx, 0, generate('CALL_START', '('));
          if (j == null) {
            return i += 1;
          }
        };
        endImplicitCall = function() {
          stack.pop();
          tokens.splice(i, 0, generate('CALL_END', ')', ['', 'end of input', token[2]]));
          return i += 1;
        };
        startImplicitObject = function(j, startsLine) {
          var idx;
          if (startsLine == null) {
            startsLine = true;
          }
          idx = j != null ? j : i;
          stack.push([
            '{', idx, {
              sameLine: true,
              startsLine: startsLine,
              ours: true
            }
          ]);
          tokens.splice(idx, 0, generate('{', generate(new String('{')), token));
          if (j == null) {
            return i += 1;
          }
        };
        endImplicitObject = function(j) {
          j = j != null ? j : i;
          stack.pop();
          tokens.splice(j, 0, generate('}', '}', token));
          return i += 1;
        };
        if (inImplicitCall() && (tag === 'IF' || tag === 'TRY' || tag === 'FINALLY' || tag === 'CATCH' || tag === 'CLASS' || tag === 'SWITCH')) {
          stack.push([
            'CONTROL', i, {
              ours: true
            }
          ]);
          return forward(1);
        }
        if (tag === 'INDENT' && inImplicit()) {
          if (prevTag !== '=>' && prevTag !== '->' && prevTag !== '[' && prevTag !== '(' && prevTag !== ',' && prevTag !== '{' && prevTag !== 'TRY' && prevTag !== 'ELSE' && prevTag !== '=') {
            while (inImplicitCall()) {
              endImplicitCall();
            }
          }
          if (inImplicitControl()) {
            stack.pop();
          }
          stack.push([tag, i]);
          return forward(1);
        }
        if (__indexOf.call(EXPRESSION_START, tag) >= 0) {
          stack.push([tag, i]);
          return forward(1);
        }
        if (__indexOf.call(EXPRESSION_END, tag) >= 0) {
          while (inImplicit()) {
            if (inImplicitCall()) {
              endImplicitCall();
            } else if (inImplicitObject()) {
              endImplicitObject();
            } else {
              stack.pop();
            }
          }
          stack.pop();
        }
        if ((__indexOf.call(IMPLICIT_FUNC, tag) >= 0 && token.spaced && !token.stringEnd && !token.regexEnd || tag === '?' && i > 0 && !tokens[i - 1].spaced) && (__indexOf.call(IMPLICIT_CALL, nextTag) >= 0 || __indexOf.call(IMPLICIT_UNSPACED_CALL, nextTag) >= 0 && !((_ref = tokens[i + 1]) != null ? _ref.spaced : void 0) && !((_ref1 = tokens[i + 1]) != null ? _ref1.newLine : void 0))) {
          if (tag === '?') {
            tag = token[0] = 'FUNC_EXIST';
          }
          startImplicitCall(i + 1);
          return forward(2);
        }
        if (__indexOf.call(IMPLICIT_FUNC, tag) >= 0 && !token.stringEnd && !token.regexEnd && this.matchTags(i + 1, 'INDENT', null, ':') && !this.findTagsBackwards(i, ['CLASS', 'EXTENDS', 'IF', 'CATCH', 'SWITCH', 'LEADING_WHEN', 'FOR', 'WHILE', 'UNTIL'])) {
          startImplicitCall(i + 1);
          stack.push(['INDENT', i + 2]);
          return forward(3);
        }
        if (tag === ':') {
          if (this.tag(i - 2) === '@') {
            s = i - 2;
          } else {
            s = i - 1;
          }
          while (this.tag(s - 2) === 'HERECOMMENT') {
            s -= 2;
          }
          this.insideForDeclaration = nextTag === 'FOR';
          startsLine = s === 0 || (_ref2 = this.tag(s - 1), __indexOf.call(LINEBREAKS, _ref2) >= 0) || tokens[s - 1].newLine;
          if (stackTop()) {
            _ref3 = stackTop(), stackTag = _ref3[0], stackIdx = _ref3[1];
            if ((stackTag === '{' || stackTag === 'INDENT' && this.tag(stackIdx - 1) === '{') && (startsLine || this.tag(s - 1) === ',' || this.tag(s - 1) === '{')) {
              return forward(1);
            }
          }
          startImplicitObject(s, !!startsLine);
          return forward(2);
        }
        if (inImplicitObject() && __indexOf.call(LINEBREAKS, tag) >= 0) {
          stackTop()[2].sameLine = false;
        }
        newLine = prevTag === 'OUTDENT' || prevToken.newLine;
        if (__indexOf.call(IMPLICIT_END, tag) >= 0 || __indexOf.call(CALL_CLOSERS, tag) >= 0 && newLine) {
          while (inImplicit()) {
            _ref4 = stackTop(), stackTag = _ref4[0], stackIdx = _ref4[1], (_ref5 = _ref4[2], sameLine = _ref5.sameLine, startsLine = _ref5.startsLine);
            if (inImplicitCall() && prevTag !== ',') {
              endImplicitCall();
            } else if (inImplicitObject() && !this.insideForDeclaration && sameLine && tag !== 'TERMINATOR' && prevTag !== ':' && endImplicitObject()) {

            } else if (inImplicitObject() && tag === 'TERMINATOR' && prevTag !== ',' && !(startsLine && this.looksObjectish(i + 1))) {
              endImplicitObject();
            } else {
              break;
            }
          }
        }
        if (tag === ',' && !this.looksObjectish(i + 1) && inImplicitObject() && !this.insideForDeclaration && (nextTag !== 'TERMINATOR' || !this.looksObjectish(i + 2))) {
          offset = nextTag === 'OUTDENT' ? 1 : 0;
          while (inImplicitObject()) {
            endImplicitObject(i + offset);
          }
        }
        return forward(1);
      });
    };

    Rewriter.prototype.addLocationDataToGeneratedTokens = function() {
      return this.scanTokens(function(token, i, tokens) {
        var column, line, nextLocation, prevLocation, _ref, _ref1;
        if (token[2]) {
          return 1;
        }
        if (!(token.generated || token.explicit)) {
          return 1;
        }
        if (token[0] === '{' && (nextLocation = (_ref = tokens[i + 1]) != null ? _ref[2] : void 0)) {
          line = nextLocation.first_line, column = nextLocation.first_column;
        } else if (prevLocation = (_ref1 = tokens[i - 1]) != null ? _ref1[2] : void 0) {
          line = prevLocation.last_line, column = prevLocation.last_column;
        } else {
          line = column = 0;
        }
        token[2] = {
          first_line: line,
          first_column: column,
          last_line: line,
          last_column: column
        };
        return 1;
      });
    };

    Rewriter.prototype.normalizeLines = function() {
      var action, condition, indent, outdent, starter;
      starter = indent = outdent = null;
      condition = function(token, i) {
        var _ref, _ref1, _ref2, _ref3;
        return token[1] !== ';' && (_ref = token[0], __indexOf.call(SINGLE_CLOSERS, _ref) >= 0) && !(token[0] === 'TERMINATOR' && (_ref1 = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref1) >= 0)) && !(token[0] === 'ELSE' && starter !== 'THEN') && !(((_ref2 = token[0]) === 'CATCH' || _ref2 === 'FINALLY') && (starter === '->' || starter === '=>')) || (_ref3 = token[0], __indexOf.call(CALL_CLOSERS, _ref3) >= 0) && this.tokens[i - 1].newLine;
      };
      action = function(token, i) {
        return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
      };
      return this.scanTokens(function(token, i, tokens) {
        var j, tag, _i, _ref, _ref1, _ref2;
        tag = token[0];
        if (tag === 'TERMINATOR') {
          if (this.tag(i + 1) === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
            tokens.splice.apply(tokens, [i, 1].concat(__slice.call(this.indentation())));
            return 1;
          }
          if (_ref = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref) >= 0) {
            tokens.splice(i, 1);
            return 0;
          }
        }
        if (tag === 'CATCH') {
          for (j = _i = 1; _i <= 2; j = ++_i) {
            if (!((_ref1 = this.tag(i + j)) === 'OUTDENT' || _ref1 === 'TERMINATOR' || _ref1 === 'FINALLY')) {
              continue;
            }
            tokens.splice.apply(tokens, [i + j, 0].concat(__slice.call(this.indentation())));
            return 2 + j;
          }
        }
        if (__indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
          starter = tag;
          _ref2 = this.indentation(tokens[i]), indent = _ref2[0], outdent = _ref2[1];
          if (starter === 'THEN') {
            indent.fromThen = true;
          }
          tokens.splice(i + 1, 0, indent);
          this.detectEnd(i + 2, condition, action);
          if (tag === 'THEN') {
            tokens.splice(i, 1);
          }
          return 1;
        }
        return 1;
      });
    };

    Rewriter.prototype.tagPostfixConditionals = function() {
      var action, condition, original;
      original = null;
      condition = function(token, i) {
        var prevTag, tag;
        tag = token[0];
        prevTag = this.tokens[i - 1][0];
        return tag === 'TERMINATOR' || (tag === 'INDENT' && __indexOf.call(SINGLE_LINERS, prevTag) < 0);
      };
      action = function(token, i) {
        if (token[0] !== 'INDENT' || (token.generated && !token.fromThen)) {
          return original[0] = 'POST_' + original[0];
        }
      };
      return this.scanTokens(function(token, i) {
        if (token[0] !== 'IF') {
          return 1;
        }
        original = token;
        this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.indentation = function(origin) {
      var indent, outdent;
      indent = ['INDENT', 2];
      outdent = ['OUTDENT', 2];
      if (origin) {
        indent.generated = outdent.generated = true;
        indent.origin = outdent.origin = origin;
      } else {
        indent.explicit = outdent.explicit = true;
      }
      return [indent, outdent];
    };

    Rewriter.prototype.generate = generate;

    Rewriter.prototype.tag = function(i) {
      var _ref;
      return (_ref = this.tokens[i]) != null ? _ref[0] : void 0;
    };

    return Rewriter;

  })();

  BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END']];

  exports.INVERSES = INVERSES = {};

  EXPRESSION_START = [];

  EXPRESSION_END = [];

  for (_i = 0, _len = BALANCED_PAIRS.length; _i < _len; _i++) {
    _ref = BALANCED_PAIRS[_i], left = _ref[0], rite = _ref[1];
    EXPRESSION_START.push(INVERSES[rite] = left);
    EXPRESSION_END.push(INVERSES[left] = rite);
  }

  EXPRESSION_CLOSE = ['CATCH', 'THEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'NULL', 'UNDEFINED', 'UNARY', 'YIELD', 'UNARY_MATH', 'SUPER', 'THROW', '@', '->', '=>', '[', '(', '{', '--', '++'];

  IMPLICIT_UNSPACED_CALL = ['+', '-'];

  IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

  SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];

  SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

  LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

  CALL_CLOSERS = ['.', '?.', '::', '?::'];

}).call(this);

},{}],16:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
(function() {
  var Scope, extend, last, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('./helpers'), extend = _ref.extend, last = _ref.last;

  exports.Scope = Scope = (function() {
    function Scope(_at_parent, _at_expressions, _at_method, _at_referencedVars) {
      var _ref1, _ref2;
      this.parent = _at_parent;
      this.expressions = _at_expressions;
      this.method = _at_method;
      this.referencedVars = _at_referencedVars;
      this.variables = [
        {
          name: 'arguments',
          type: 'arguments'
        }
      ];
      this.positions = {};
      if (!this.parent) {
        this.utilities = {};
      }
      this.root = (_ref1 = (_ref2 = this.parent) != null ? _ref2.root : void 0) != null ? _ref1 : this;
    }

    Scope.prototype.add = function(name, type, immediate) {
      if (this.shared && !immediate) {
        return this.parent.add(name, type, immediate);
      }
      if (Object.prototype.hasOwnProperty.call(this.positions, name)) {
        return this.variables[this.positions[name]].type = type;
      } else {
        return this.positions[name] = this.variables.push({
          name: name,
          type: type
        }) - 1;
      }
    };

    Scope.prototype.namedMethod = function() {
      var _ref1;
      if (((_ref1 = this.method) != null ? _ref1.name : void 0) || !this.parent) {
        return this.method;
      }
      return this.parent.namedMethod();
    };

    Scope.prototype.find = function(name) {
      if (this.check(name)) {
        return true;
      }
      this.add(name, 'var');
      return false;
    };

    Scope.prototype.parameter = function(name) {
      if (this.shared && this.parent.check(name, true)) {
        return;
      }
      return this.add(name, 'param');
    };

    Scope.prototype.check = function(name) {
      var _ref1;
      return !!(this.type(name) || ((_ref1 = this.parent) != null ? _ref1.check(name) : void 0));
    };

    Scope.prototype.temporary = function(name, index) {
      if (name.length > 1) {
        return '_' + name + (index > 1 ? index - 1 : '');
      } else {
        return '_' + (index + parseInt(name, 36)).toString(36).replace(/\d/g, 'a');
      }
    };

    Scope.prototype.type = function(name) {
      var v, _i, _len, _ref1;
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.name === name) {
          return v.type;
        }
      }
      return null;
    };

    Scope.prototype.freeVariable = function(name, reserve) {
      var index, temp;
      if (reserve == null) {
        reserve = true;
      }
      index = 0;
      while (true) {
        temp = this.temporary(name, index);
        if (!(this.check(temp) || __indexOf.call(this.root.referencedVars, temp) >= 0)) {
          break;
        }
        index++;
      }
      if (reserve) {
        this.add(temp, 'var', true);
      }
      return temp;
    };

    Scope.prototype.assign = function(name, value) {
      this.add(name, {
        value: value,
        assigned: true
      }, true);
      return this.hasAssignments = true;
    };

    Scope.prototype.hasDeclarations = function() {
      return !!this.declaredVariables().length;
    };

    Scope.prototype.declaredVariables = function() {
      var realVars, tempVars, v, _i, _len, _ref1;
      realVars = [];
      tempVars = [];
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.type === 'var') {
          (v.name.charAt(0) === '_' ? tempVars : realVars).push(v.name);
        }
      }
      return realVars.sort().concat(tempVars.sort());
    };

    Scope.prototype.assignedVariables = function() {
      var v, _i, _len, _ref1, _results;
      _ref1 = this.variables;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.type.assigned) {
          _results.push(v.name + " = " + v.type.value);
        }
      }
      return _results;
    };

    return Scope;

  })();

}).call(this);

},{"./helpers":10}],17:[function(require,module,exports){
// Generated by CoffeeScript 1.9.0
(function() {
  var LineMap, SourceMap;

  LineMap = (function() {
    function LineMap(_at_line) {
      this.line = _at_line;
      this.columns = [];
    }

    LineMap.prototype.add = function(column, _arg, options) {
      var sourceColumn, sourceLine;
      sourceLine = _arg[0], sourceColumn = _arg[1];
      if (options == null) {
        options = {};
      }
      if (this.columns[column] && options.noReplace) {
        return;
      }
      return this.columns[column] = {
        line: this.line,
        column: column,
        sourceLine: sourceLine,
        sourceColumn: sourceColumn
      };
    };

    LineMap.prototype.sourceLocation = function(column) {
      var mapping;
      while (!((mapping = this.columns[column]) || (column <= 0))) {
        column--;
      }
      return mapping && [mapping.sourceLine, mapping.sourceColumn];
    };

    return LineMap;

  })();

  SourceMap = (function() {
    var BASE64_CHARS, VLQ_CONTINUATION_BIT, VLQ_SHIFT, VLQ_VALUE_MASK;

    function SourceMap() {
      this.lines = [];
    }

    SourceMap.prototype.add = function(sourceLocation, generatedLocation, options) {
      var column, line, lineMap, _base;
      if (options == null) {
        options = {};
      }
      line = generatedLocation[0], column = generatedLocation[1];
      lineMap = ((_base = this.lines)[line] || (_base[line] = new LineMap(line)));
      return lineMap.add(column, sourceLocation, options);
    };

    SourceMap.prototype.sourceLocation = function(_arg) {
      var column, line, lineMap;
      line = _arg[0], column = _arg[1];
      while (!((lineMap = this.lines[line]) || (line <= 0))) {
        line--;
      }
      return lineMap && lineMap.sourceLocation(column);
    };

    SourceMap.prototype.generate = function(options, code) {
      var buffer, lastColumn, lastSourceColumn, lastSourceLine, lineMap, lineNumber, mapping, needComma, v3, writingline, _i, _j, _len, _len1, _ref, _ref1;
      if (options == null) {
        options = {};
      }
      if (code == null) {
        code = null;
      }
      writingline = 0;
      lastColumn = 0;
      lastSourceLine = 0;
      lastSourceColumn = 0;
      needComma = false;
      buffer = "";
      _ref = this.lines;
      for (lineNumber = _i = 0, _len = _ref.length; _i < _len; lineNumber = ++_i) {
        lineMap = _ref[lineNumber];
        if (lineMap) {
          _ref1 = lineMap.columns;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            mapping = _ref1[_j];
            if (!(mapping)) {
              continue;
            }
            while (writingline < mapping.line) {
              lastColumn = 0;
              needComma = false;
              buffer += ";";
              writingline++;
            }
            if (needComma) {
              buffer += ",";
              needComma = false;
            }
            buffer += this.encodeVlq(mapping.column - lastColumn);
            lastColumn = mapping.column;
            buffer += this.encodeVlq(0);
            buffer += this.encodeVlq(mapping.sourceLine - lastSourceLine);
            lastSourceLine = mapping.sourceLine;
            buffer += this.encodeVlq(mapping.sourceColumn - lastSourceColumn);
            lastSourceColumn = mapping.sourceColumn;
            needComma = true;
          }
        }
      }
      v3 = {
        version: 3,
        file: options.generatedFile || '',
        sourceRoot: options.sourceRoot || '',
        sources: options.sourceFiles || [''],
        names: [],
        mappings: buffer
      };
      if (options.inline) {
        v3.sourcesContent = [code];
      }
      return JSON.stringify(v3, null, 2);
    };

    VLQ_SHIFT = 5;

    VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;

    VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;

    SourceMap.prototype.encodeVlq = function(value) {
      var answer, nextChunk, signBit, valueToEncode;
      answer = '';
      signBit = value < 0 ? 1 : 0;
      valueToEncode = (Math.abs(value) << 1) + signBit;
      while (valueToEncode || !answer) {
        nextChunk = valueToEncode & VLQ_VALUE_MASK;
        valueToEncode = valueToEncode >> VLQ_SHIFT;
        if (valueToEncode) {
          nextChunk |= VLQ_CONTINUATION_BIT;
        }
        answer += this.encodeBase64(nextChunk);
      }
      return answer;
    };

    BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    SourceMap.prototype.encodeBase64 = function(value) {
      return BASE64_CHARS[value] || (function() {
        throw new Error("Cannot Base64 encode value: " + value);
      })();
    };

    return SourceMap;

  })();

  module.exports = SourceMap;

}).call(this);

},{}],18:[function(require,module,exports){

},{}],19:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("IrXUsu"))
},{"IrXUsu":20}],20:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],21:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":22}],22:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],23:[function(require,module,exports){
(function (global){
(function() {
  var vm,
    __slice = [].slice;

  vm = require('vm');

  exports.allowUnsafeEval = function(fn) {
    var previousEval;
    previousEval = global["eval"];
    try {
      global["eval"] = function(source) {
        return vm.runInThisContext(source);
      };
      return fn();
    } finally {
      global["eval"] = previousEval;
    }
  };

  exports.allowUnsafeNewFunction = function(fn) {
    var previousFunction;
    previousFunction = global.Function;
    try {
      global.Function = exports.Function;
      return fn();
    } finally {
      global.Function = previousFunction;
    }
  };

  exports.Function = function() {
    var body, paramList, paramLists, params, _i, _j, _len;
    paramLists = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), body = arguments[_i++];
    params = [];
    for (_j = 0, _len = paramLists.length; _j < _len; _j++) {
      paramList = paramLists[_j];
      if (typeof paramList === 'string') {
        paramList = paramList.split(/\s*,\s*/);
      }
      params.push.apply(params, paramList);
    }
    return vm.runInThisContext("(function(" + (params.join(', ')) + ") {\n  " + body + "\n})");
  };

}).call(this);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"vm":21}],24:[function(require,module,exports){
module.exports = require('./lib/extend');


},{"./lib/extend":25}],25:[function(require,module,exports){
/*!
 * node.extend
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * @fileoverview
 * Port of jQuery.extend that actually works on node.js
 */
var is = require('is');

function extend() {
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;
  var options, name, src, copy, copy_is_array, clone;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !is.fn(target)) {
    target = {};
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    options = arguments[i]
    if (options != null) {
      if (typeof options === 'string') {
          options = options.split('');
      }
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (is.hash(copy) || (copy_is_array = is.array(copy)))) {
          if (copy_is_array) {
            copy_is_array = false;
            clone = src && is.array(src) ? src : [];
          } else {
            clone = src && is.hash(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);

        // Don't bring in undefined values
        } else if (typeof copy !== 'undefined') {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

/**
 * @public
 */
extend.version = '1.0.8';

/**
 * Exports module.
 */
module.exports = extend;


},{"is":26}],26:[function(require,module,exports){

/**!
 * is
 * the definitive JavaScript type testing library
 *
 * @copyright 2013-2014 Enrico Marino / Jordan Harband
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toString = objProto.toString;
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  boolean: 1,
  number: 1,
  string: 1,
  undefined: 1
};

var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
var hexRegex = /^[A-Fa-f0-9]+$/;

/**
 * Expose `is`
 */

var is = module.exports = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a = is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return typeof value !== 'undefined';
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toString.call(value);
  var key;

  if ('[object Array]' === type || '[object Arguments]' === type || '[object String]' === type) {
    return value.length === 0;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (owns.call(value, key)) { return false; }
    }
    return true;
  }

  return false;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function (value, other) {
  var strictlyEqual = value === other;
  if (strictlyEqual) {
    return true;
  }

  var type = toString.call(value);
  var key;

  if (type !== toString.call(other)) {
    return false;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (!is.equal(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!is.equal(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }

  if ('[object Array]' === type) {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (--key) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Function]' === type) {
    return value.prototype === other.prototype;
  }

  if ('[object Date]' === type) {
    return value.getTime() === other.getTime();
  }

  return strictlyEqual;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.nil / is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is.nil = is['null'] = function (value) {
  return value === null;
};

/**
 * is.undef / is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undef = is['undefined'] = function (value) {
  return typeof value === 'undefined';
};

/**
 * Test arguments.
 */

/**
 * is.args
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.args = is['arguments'] = function (value) {
  var isStandardArguments = '[object Arguments]' === toString.call(value);
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = function (value) {
  return '[object Array]' === toString.call(value);
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.args.empty = function (value) {
  return is.args(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.boolean(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.boolean
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.boolean = function (value) {
  return '[object Boolean]' === toString.call(value);
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.boolean(value) && Boolean(Number(value)) === false;
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.boolean(value) && Boolean(Number(value)) === true;
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return '[object Date]' === toString.call(value);
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return '[object Error]' === toString.call(value);
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  return isAlert || '[object Function]' === toString.call(value);
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return '[object Number]' === toString.call(value);
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.int
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.int = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */

is.object = function (value) {
  return '[object Object]' === toString.call(value);
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return '[object RegExp]' === toString.call(value);
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return '[object String]' === toString.call(value);
};

/**
 * Test base64 string.
 */

/**
 * is.base64
 * Test if `value` is a valid base64 encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
 * @api public
 */

is.base64 = function (value) {
  return is.string(value) && (!value.length || base64Regex.test(value));
};

/**
 * Test base64 string.
 */

/**
 * is.hex
 * Test if `value` is a valid hex encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
 * @api public
 */

is.hex = function (value) {
  return is.string(value) && (!value.length || hexRegex.test(value));
};

},{}]},{},[1])(1)