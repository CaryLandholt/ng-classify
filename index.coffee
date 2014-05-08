_             = require 'lodash'
classDetails  = require './lib/classDetails'
formatOptions = require './lib/formatOptions'
moduleDetails = require './lib/moduleDetails'
moduleOptions = require './lib/moduleOptions'
moduleTypes   = require './lib/moduleTypes'

module.exports = (content, options) ->
	formatOpts   = formatOptions options
	opts         = moduleOptions formatOpts, options
	modTypes     = moduleTypes opts.prefix
	content      = _.template content, opts.data if opts.data
	appName      = opts.appName
	details      = classDetails content, modTypes
	modules      = []
	contentLines = content.split '\n'

	# take the following class line
	# class Home extends Controler
	# the following will result in
	# class Home
	getTrimmedContent = (contentLines, position) ->
		row               = position.row
		start             = position.start
		lineContent       = contentLines[row]
		line              = lineContent.slice 0, position.start + 1
		contentLines[row] = line

		contentLines

	# add appName to moduleDetails
	details.forEach (detail) ->
		detail.appName = appName
		modDetails     = moduleDetails detail, opts
		contentLines   = getTrimmedContent contentLines, detail.position

		modules.push modDetails

	ngClassified  = contentLines.join '\n'
	ngClassified += '\n\n' if modules.length isnt 0
	ngClassified += modules.join '\n'