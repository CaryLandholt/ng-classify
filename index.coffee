classDetails  = require './lib/classDetails'
formatOptions = require './lib/formatOptions'
moduleDetails = require './lib/moduleDetails'
moduleOptions = require './lib/moduleOptions'
moduleTypes   = require './lib/moduleTypes'

module.exports = (content, options) ->
	formatOpts   = formatOptions options
	opts         = moduleOptions formatOpts, options
	modTypes     = moduleTypes opts.prefix
	appName      = opts.appName
	details      = classDetails content, modTypes

	# separate App moduleType from others
	appClassDetails    = (detail for detail in details when detail.moduleType is 'App')
	nonAppClassDetails = (detail for detail in details when detail.moduleType isnt 'App')

	# ensure App moduleType is first
	details = []
		.concat appClassDetails
		.concat nonAppClassDetails

	contentLines = content.split '\n'

	# take the following class line
	# class Home extends Controler
	#
	# the following will result in
	# class Home
	getTrimmedContent = (contentLines, position) ->
		# clone the original
		lines       = contentLines.slice 0
		row         = position.row
		start       = position.start
		end         = position.end
		lineContent = lines[row]
		characters  = lineContent.split ''

		delete characters[i] for i in [start + 1..end]

		line       = characters.join ''
		lines[row] = line

		lines

	# add appName to moduleDetails
	modules = for detail in details
		detail.appName = appName
		modDetails     = moduleDetails detail, opts
		contentLines   = getTrimmedContent contentLines, detail.position

		modDetails

	hasModules         = modules.length isnt 0
	hasAppClassDetails = appClassDetails.length isnt 0

	# prepend App getter
	if hasModules and not hasAppClassDetails
		app = "angular.module '#{appName}'"

		modules.unshift app

	ngClassified  = contentLines.join '\n'
	ngClassified += '\n\n' if modules.length isnt 0
	ngClassified += modules.join '\n'