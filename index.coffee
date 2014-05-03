_             = require 'lodash'
classDetails  = require './lib/classDetails'
formatOptions = require './lib/formatOptions'
moduleDetails = require './lib/moduleDetails'
moduleOptions = require './lib/moduleOptions'
moduleTypes   = require './lib/moduleTypes'

module.exports = (contents, opt) ->
	formatOpts = formatOptions opt
	options    = moduleOptions formatOpts, opt
	contents   = _.template contents, options.data if options.data
	appName    = options.appName
	details    = classDetails contents
	modules    = []

	details.forEach (detail) ->
		detail.appName = appName

		modules.push moduleDetails detail, options

	moduleTypes.forEach (moduleType) ->
		normalizedModuleType = moduleType[0].toUpperCase() + moduleType[1..]
		searchFor            = " extends #{normalizedModuleType}"
		regex                = new RegExp searchFor, 'g'
		contents             = contents.replace regex, ''

	contents += '\n\n' if modules.length isnt 0
	contents += modules.join '\n'