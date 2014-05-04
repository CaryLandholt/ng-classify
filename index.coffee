_             = require 'lodash'
classDetails  = require './lib/classDetails'
formatOptions = require './lib/formatOptions'
moduleDetails = require './lib/moduleDetails'
moduleOptions = require './lib/moduleOptions'
moduleTypes   = require './lib/moduleTypes'

module.exports = (content, options) ->
	formatOpts = formatOptions options
	opts       = moduleOptions formatOpts, options
	content    = _.template content, opts.data if opts.data
	appName    = opts.appName
	details    = classDetails content
	modules    = []

	# add appName to moduleDetails
	details.forEach (detail) ->
		detail.appName = appName

		modules.push moduleDetails detail, opts

	# remove angular moduleTypes from content
	moduleTypes.forEach (moduleType) ->
		searchFor = " extends #{moduleType}"
		regex     = new RegExp searchFor, 'g'
		content  = content.replace regex, ''

	content += '\n\n' if modules.length isnt 0
	content += modules.join '\n'