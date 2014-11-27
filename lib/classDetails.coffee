{allowUnsafeEval} = require 'loophole'
coffeeScript      = require 'coffee-script'
nodes             = coffeeScript.nodes

module.exports = (content, moduleTypes) ->
	classDetails = []

	isAngularModuleType = (moduleType) ->
		moduleType in moduleTypes

	processNode = (node) ->
		appName = null
		node    = node.expression if node.expression
		body    = node.body
		isClass = node.variable and node.parent and body?.classBody

		return if isClass
			base          = node.variable.base
			className     = base.value
			classLocation = base.locationData
			parent        = node.parent
			isExtends     = parent?

			position =
				row:   classLocation.last_line
				start: classLocation.last_column

			return if not isExtends

			base = parent.base

			# handle extends ModuleType('appName')
			hasAppName = not base

			if hasAppName
				moduleType   = parent.variable.base.value
				position.end = parent.locationData.last_column
				parent       = parent.args[0]
				base         = parent.base
				appName      = base.value

				throw new Error 'appName must be a string' if typeof appName isnt 'string'

				appName = allowUnsafeEval -> eval appName
			else
				position.end = base.locationData.last_column
				moduleType   = base.value

			# handle namespaces (e.g. Ng.Controller)
			properties   = parent.properties
			isNamespaced = properties.length > 0

			if isNamespaced
				position.end = property.locationData.last_column for property in properties
				namespaces   = (property.name.value for property in properties)
				moduleType  += '.' + namespaces.join '.'

			isAngular  = isAngularModuleType moduleType

			return if not isAngular

			classDetails.push {className, moduleType, appName, parameters: [], position}
			processNodes body.expressions

		# check to see if there exists a wrapper function (e.g. define, etc.)
		hasWrapper = node?.args?[0]?.body?.expressions?

		return if hasWrapper
			processNodes node.args[0].body.expressions

		base          = node.base
		hasProperties = base?.properties

		return if hasProperties
			processNodes base.properties

		isConstructor = node.value and node.variable?.base.value is 'constructor'

		return if not isConstructor

		params     = node.value.params
		isDo       = node.value.do?
		parameters = []

		return if isDo
			classDetails[classDetails.length - 1].parameters = parameters

		params.forEach (param) ->
			isThis = param.name.this?

			# handle @ (this)
			return if isThis
				properties = param.name.properties
				props      = (property.name.value for property in properties)

				parameters.push props

			parameters.push param.name.value

		# add parameters to last classDetail
		classDetails[classDetails.length - 1].parameters = parameters

		processNodes node.value.body.expressions

	processNodes = (nodes) ->
		processNode node for node in nodes

	# add quotes around parameters
	# add class as last parameter
	normalizeParameters = ->
		classDetails.forEach (details) ->
			hasParameters = details.parameters?

			return if not hasParameters

			details.parameters[i] = "'#{parameter}'" for parameter, i in details.parameters

			details.parameters.push details.className

	processNodes nodes(content).expressions
	normalizeParameters()

	classDetails