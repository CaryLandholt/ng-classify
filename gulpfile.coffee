CHANGELOG_FILE        = 'CHANGELOG.md'

browserify            = require 'gulp-browserify'
conventionalChangelog = require 'conventional-changelog'
fs                    = require 'fs'
gulp                  = require 'gulp'
gutil                 = require 'gulp-util'
insert                = require 'gulp-insert'
jasmine               = require 'gulp-jasmine'
pkg                   = require './package.json'
rename                = require 'gulp-rename'

gulp.task 'bundle', ->
	options =
		extensions: [
			'.coffee'
		]
		transform: [
			'coffeeify'
		]

	gulp
		.src 'index.coffee', {cwd: './', read: false}
		.pipe browserify options
		.pipe rename 'ng-classify-commonjs.js'
		.pipe insert.prepend 'module.exports = '
		.pipe insert.prepend "// ng-classify v#{pkg.version}\n"
		.pipe insert.append '(1)'
		.pipe gulp.dest './dist/'

gulp.task 'changelog', ['bundle'],  ->
	options =
		repository : pkg.repository.url
		version    : pkg.version
		file       : CHANGELOG_FILE
		log        : gutil.log

	conventionalChangelog options, (err, log) ->
		fs.writeFile CHANGELOG_FILE, log

gulp.task 'default', ['test']

gulp.task 'test', ->
	options =
		verbose: true

	gulp
		.src '**/*.spec.coffee', cwd: 'test/'
		.pipe jasmine options