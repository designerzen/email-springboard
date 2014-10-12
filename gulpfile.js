/*

This is just a handy Gulp Boilerplate that
handles the compilation of the source elements

Less 	-> 	CSS 3
Jade 	-> 	xHTML


Premailer Options : 

	
options.mode

Type: String Default value: 'html'

Output format. Either 'html' (HTML formatted email) or 'txt' (plaintext email).
options.baseUrl

Type: String Default value: ''

Base URL to append to relative links.
options.bundleExec

Type: Boolean Default value: false

Run premailer with bundle exec ruby.
options.queryString

Type: String Default value: ''

Query string to append to links.
options.css

Type: Array Default value: []

Additional CSS stylesheets to process. Paths are relative to the Gruntfile.js file. Any Grunt compatible globbing and template syntax is supported.
options.removeClasses

Type: Boolean Default value: false

Removes HTML classes.
options.removeScripts

Type: Boolean Default value: false

Removes HTML scripts. _(was true by default until v0.2.5)
options.removeComments

Type: Boolean Default value: false

Removes HTML comments.
options.preserveStyles

Type: Boolean Default value: false

Preserve any link rel=stylesheet and style elements.
options.lineLength

Type: Number Default value: 65

Line length for plaintext version.
options.ioException

Type: Boolean Default value: false

Aborts on I/O errors.
options.verbose

Type: Boolean Default value: false

Prints additional information at runtime.

*/

// =======================---------------- IMPORT DEPENDENCIES --------------------

// Requirements for this build to work :
var gulp = require('gulp');						// main Gulp
var concat = require('gulp-concat');			// combine files

// JS Plugins
var minify = require('gulp-minify');			// squash files

var newer = require('gulp-newer');				// deal with only modified files
var imagemin = require('gulp-imagemin');		// squish images

// CSS Plugins
var less = require('gulp-less');				// compile less files to css

// HTML Plugins
var jade = require('gulp-jade');
var premailer = require('gulp-premailer');
var htmlmin = require('gulp-htmlmin');

var del = require('del');						// delete things and folders
var sequencer = require('run-sequence');

var livereload = require('gulp-livereload');
// =======================---------------- CONFIGURATION --------------------

// Set up paths here!
var SOURCE_FOLDER 			= 'src/';		// Source files Root
var BUILD_FOLDER 			= 'build/';		// Where the initial build occurs (debugable)
var DISTRIBUTION_FOLDER 	= 'dist/';		// Once debugging is complete, copy to server ready files here

// Where do our source files live?
var source = {
	styles 	: SOURCE_FOLDER+'*.less',
	jade 	: SOURCE_FOLDER+'*.jade',
	jade_examples 	: SOURCE_FOLDER+'examples/*.jade',
	images	: SOURCE_FOLDER+'images/**/*'
};

// Where shall we compile them to?
var destination = {
	styles 	: BUILD_FOLDER,
	html 	: BUILD_FOLDER,
	images	: BUILD_FOLDER+'img'
};

var imageCrunchOptions = {
	optimizationLevel: 3,
	progressive: false
};

var premailerOptions = {
	mode:'txt'
};

var htmlSquishOptions = {
	removeComments     : true,
	collapseWhitespace : true,
	minifyCSS          : true,
	keepClosingSlash   : true
};

// =======================---------------- TASK DEFINITIONS --------------------

gulp.task('clean', function(cb) {
	// You can use multiple globbing patterns as you would with `gulp.src`
	del([BUILD_FOLDER,DISTRIBUTION_FOLDER], cb);
});


// Jade ==========================================================
gulp.task('jade', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	// with sourcemaps all the way down
	return 	gulp.src( source.jade )
			.pipe( jade( { pretty:false, debug:false, compileDebug:false } ) )
			.pipe( gulp.dest( destination.html ) );
});

gulp.task('compile-examples', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	// with sourcemaps all the way down
	return 	gulp.src( source.jade_examples )
			.pipe( jade( { pretty:false, debug:false, compileDebug:false } ) )
			.pipe( gulp.dest( destination.html ) );
});

gulp.task('assemble', function () {
    return 	gulp.src( destination.html +'*.html')
			.pipe( premailer(premailerOptions) )
			.pipe( htmlmin(htmlSquishOptions) )
			.pipe( gulp.dest(DISTRIBUTION_FOLDER) );
});

// Image Tasks ===================================================

// Copy all static images & squish
gulp.task('images', function() {
	return 	gulp.src( source.images)
			.pipe( newer(destination.images) )
			// Pass in options to the task
			.pipe( imagemin( imageCrunchOptions ) )
			.pipe( gulp.dest( destination.images ) );
});



// Cascading Style Sheets ========================================

gulp.task('css', function() {
	return 	gulp.src( source.styles )
			.pipe( newer( destination.styles ) )
			// compile less
			.pipe( less( {strictMath: false, compress: true }) )
			// lint
			// squish
			//.pipe( minify() )
			.pipe( gulp.dest( destination.styles ) );
});


// Utilities =====================================================

// Rerun the task when a file changes
gulp.task('watch', function() {

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});
// =======================---------------- TASKS --------------------

/*

// Assembly

1. Compile css from less 
2. Squish css

3. Compile Jade templates
4. Inject css into header
5. Inline css into page elements
6. Compress html 

7. Minify Images

*/


// compile all assets & create sourcemaps
gulp.task('build', 		[ 'css', 'jade', 'images' ] );

// squish everything & concatanate scripts
gulp.task('deploy', 	[ 'build', 'assemble' ] );
gulp.task('distribute', ['deploy'] );

// create a server to host this project
gulp.task('serve', 		['images', 'watch'] );

// This creates the examples :)
gulp.task('examples', function(callback) {
	sequencer(
		'clean',
		[ 'css', 'compile-examples', 'images' ],
		'assemble',
    callback);
});

// The default task (called when you run `gulp` from cli)
// As many of these tasks are not asynch
gulp.task('default', function(callback) {
	sequencer(
		'clean',
		'build',
		'assemble',
    callback);
});