module.exports = (prefix = '') ->
	# ensure prefix ends in a period (.), if a prefix has been provided
	prefix += '.' if prefix isnt '' and prefix[-1..] isnt '.'

	moduleTypes = ['Animation', 'App', 'Config', 'Constant', 'Controller', 'Directive', 'Factory', 'Filter', 'Provider', 'Run', 'Service', 'Value']
	moduleTypes = ("#{prefix}#{moduleType}" for moduleType in moduleTypes)