/*

This is just a handy Gulp Boilerplate that
handles the compilation of the source elements

Less 	-> 	CSS 3
Jade 	-> 	xHTML


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

// =======================---------------- CONFIGURATION --------------------

// Set up paths here!
var SOURCE_FOLDER 			= 'src/';		// Source files Root
var BUILD_FOLDER 			= 'build/';		// Where the initial build occurs (debugable)
var DISTRIBUTION_FOLDER 	= 'dist/';		// Once debugging is complete, copy to server ready files here

// Where do our source files live?
var source = {
	styles 	: SOURCE_FOLDER+'*.less',
	jade 	: SOURCE_FOLDER+'*.jade',
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

var htmlSquishOptions = {
	removeComments     : true,
	collapseWhitespace : true,
	minifyCSS          : true,
	keepClosingSlash   : true
}

// =======================---------------- TASK DEFINITIONS --------------------

gulp.task('clean', function(cb) {
	// You can use multiple globbing patterns as you would with `gulp.src`
	del([BUILD_FOLDER+'**',DISTRIBUTION_FOLDER+'**'], cb);
});


// Jade ==========================================================
gulp.task('jade', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	// with sourcemaps all the way down
	return 	gulp.src( source.jade )
			.pipe( jade( { pretty:true, debug:false, compileDebug:false } ) )
			.pipe( gulp.dest( destination.html ) );
});

gulp.task('assemble', function () {
    return 	gulp.src( destination.html +'*.html')
			.pipe( premailer() )
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
	gulp.watch( source.images, ['images'] );
	gulp.watch( source.jade, ['jade'] );
	gulp.watch( source.styles, ['css'] );
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

grunt build
grunt deploy
*/


// compile all assets & create sourcemaps
gulp.task('build', 		[ 'css', 'jade', 'images' ] );

// squish everything & concatanate scripts
gulp.task('deploy', 	[ 'build', 'assemble' ] );
gulp.task('distribute', ['deploy'] );

// create a server to host this project
gulp.task('serve', 		['images', 'watch'] );

// The default task (called when you run `gulp` from cli)
// As many of these tasks are not asynch
gulp.task('default', function(callback) {
	sequencer(
		'clean',
		'build',
		'assemble',
    callback);
});