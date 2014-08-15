classDetails  = require './lib/classDetails'
extend        = require 'node.extend'
formatOptions = require './lib/formatOptions'
moduleDetails = require './lib/moduleDetails'
moduleOptions = require './lib/moduleOptions'
moduleTypes   = require './lib/moduleTypes'

module.exports = (content, options) ->
	formatOpts   = formatOptions options
	opts         = moduleOptions formatOpts, options
	modTypes     = moduleTypes opts.prefix
	appName      = if not opts.appName then 'app' else opts.appName
	details      = classDetails content, modTypes
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

	apps = {}

	details.forEach (detail) ->
		moduleAppName = if not detail.appName then appName else detail.appName
		modDetails    = moduleDetails extend(true, detail, {appName: moduleAppName}), opts
		contentLines  = getTrimmedContent contentLines, detail.position

		if not apps[moduleAppName]
			apps[moduleAppName] = {}

		if detail.moduleType is 'App'
			if not apps[moduleAppName].appTypes
				apps[moduleAppName].appTypes = []

			apps[moduleAppName].appTypes.push modDetails
		else
			if not apps[moduleAppName].nonAppTypes
				apps[moduleAppName].nonAppTypes = []

			apps[moduleAppName].nonAppTypes.push modDetails

	lines = []

	for app, modDetails of apps
		# add newline between angular.module statements
		lines.push '' if lines.length isnt 0

		if modDetails.appTypes
			modDetails.appTypes.forEach (appType) ->
				lines.push appType
		else
			lines.push "angular.module('#{app}')"

		if modDetails.nonAppTypes and modDetails.nonAppTypes.length > 0
			modDetails.nonAppTypes.forEach (nonAppType) ->
				lines.push nonAppType

	ngClassified  = contentLines.join '\n'
	ngClassified += '\n\n' if lines.length
	ngClassified += lines.join '\n'