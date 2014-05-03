coffeeScript = require 'coffee-script'
moduleTypes  = require './moduleTypes'
nodes        = coffeeScript.nodes

module.exports = (contents) ->
	expressions  = nodes(contents).expressions
	classDetails = []

	for key, node of expressions
		hasExtends = node.parent

		continue if not hasExtends

		className = node.variable.base.value
		eExtends  = node.parent.base.value
		isAngular = eExtends in moduleTypes

		continue if not isAngular

		expression            = node.body.expressions[0]
		hasConstructorParams  = expression.base?
		constructorParameters = []

		if hasConstructorParams
			constructorParams = {}

			expression.base.properties.forEach (prop, i) ->
				if prop.value
					constructorParams = prop.value.params

			constructorParams.forEach (constructorParam) ->
				name                 = constructorParam.name
				properties           = name.properties
				hasProperties        = properties?
				constructorParameter = if hasProperties then properties[0].name.value else name.value

				constructorParameters.push "'#{constructorParameter}'"

		constructorParameters.push className
		classDetails.push {className, moduleType: eExtends, parameters: constructorParameters}

	classDetails