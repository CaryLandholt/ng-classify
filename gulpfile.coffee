CHANGELOG_FILE        = 'CHANGELOG.md'

conventionalChangelog = require 'conventional-changelog'
fs                    = require 'fs'
gulp                  = require 'gulp'
gutil                 = require 'gulp-util'
pkg                   = require './package.json'

gulp.task 'changelog', ->
	options =
		repository: pkg.repository.url
		version: pkg.version
		file: CHANGELOG_FILE
		log: gutil.log

	conventionalChangelog options, (err, log) ->
		fs.writeFile CHANGELOG_FILE, log