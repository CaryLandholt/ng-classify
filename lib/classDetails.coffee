coffeeScript = require 'coffee-script'
nodes        = coffeeScript.nodes

module.exports = (content, moduleTypes) ->
	classDetails = []

	isAngularModuleType = (moduleType) ->
		moduleType in moduleTypes

	processNode = (node) ->
		node    = node.expression if node.expression
		body    = node.body
		isClass = node.variable and node.parent and body?.classBody

		return if isClass
			className = node.variable.base.value
			parent    = node.parent
			isExtends = parent?

			return if not isExtends

			moduleType = parent.base.value

			# handle namespaces (e.g. Ng.Controller)
			properties   = parent.properties
			isNamespaced = properties.length > 0

			if isNamespaced
				namespaces = (property.name.value for property in properties)
				moduleType += '.' + namespaces.join '.'

			isAngular  = isAngularModuleType moduleType

			return if not isAngular

			classDetails.push {className, moduleType, parameters: []}
			processNodes body.expressions

		base          = node.base
		hasProperties = base?.properties

		return if hasProperties
			processNodes base.properties

		isConstructor = node.value and node.variable?.base.value is 'constructor'

		return if not isConstructor

		params     = node.value.params
		parameters = []

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