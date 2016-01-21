// =======================---------------- IMPORT DEPENDENCIES --------------------

var Styliner = require('styliner');

// Requirements for this build to work :
var gulp = require('gulp');						// main Gulp
var concat = require('gulp-concat');			// combine files

// JS Plugins
var minify = require('gulp-minify');			// squash files

//var newer = require('gulp-newer');				// deal with only modified files
var imagemin = require('gulp-imagemin');		// squish images

// CSS Plugins
var less = require('gulp-less');				// compile less files to css

// HTML Plugins
var jade = require('gulp-jade');
//var premailer = require('gulp-premailer');
var htmlmin = require('gulp-htmlmin');

var del = require('del');						// delete things and folders
var sequencer = require('run-sequence');
var path = require('path');
var fs = require('fs');

var uncss = require('gulp-uncss');
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


// Set up paths here!
var DEBUG 								= true;
var SOURCE_FOLDER 				= 'src/';		// Source files Root
var BUILD_FOLDER 					= 'build/';		// Where the initial build occurs (debugable)
var DISTRIBUTION_FOLDER 	= 'distribute/';		// Once debugging is complete, copy to server ready files here


//Options
var options = {};

// True to minify all output. This option removes all extraneous whitespace from the generated HTML (including any remaining inline stylesheets)
options.compact = true;

// True to not emit <style> tags for rules that cannot be inlined.
// This option will completely drop any dynamic CSS rules.
// (such as media queries, pseudo-elements, or @font-faces)
options.noCSS = true;

// True to keep all rules in <style> tags instead of inlining static rules into elements.
// This results in smaller files, but will not work with Gmail.
options.keepRules = false;

// True to add an attribute/ID selector to all rules in media queries to fix a bug in Yahoo Mail.
// Yahoo Mail drops all media queries, converting their contents to regular rules that will always be applied.
// This option adds a workaround for that.
options.fixYahooMQ = true;

// Don't skip properties that parserlib reports as invalid. (all invalid properties are always logged as winston errors)
// Pass this option if you're using features that parser doesn't recognize, or if you come across a bug in parserlib
// This option breaks Acid2, which tests that valid properties from earlier rules replace invalid properties from later rules. (see also the first known issue)
options.keepInvalid = true;

// The path containing referenced URLs.
// All non-absolute URLs in <a> tags, <img> tags, and stylesheets will have this path prepended.
// For greater flexibility, pass a url() function instead.
// options.urlPrefix = "dir/";

// A function called to resolve URLs.
// All non-absolute URLs in HTML or CSS will be replaced by the return value of this function.
// The function is passed the relative path to the file and the source of the URL ("img" or "a" or other HTML tags; URLs from CSS pass "img").
// It can return a promise or a string.
// options.url = function(path, type);





// =======================---------------- CONFIGURATION --------------------

// Where do our source files live?
var source = {
	styles 	: SOURCE_FOLDER+'email.less',
	jade 	: [
		SOURCE_FOLDER + '*.jade',
		'!' + SOURCE_FOLDER + '*base*'
	],
	jade_examples 	: SOURCE_FOLDER+'examples/*.jade',
	images	: [
		SOURCE_FOLDER+'**/*.+(ico|png|gif|jpg|jpeg|svg)',
		'!'+SOURCE_FOLDER+'examples/**'
	]
};

// Where shall we compile them to?
var generateDestinations = function( rootPath ) {
	return {
		styles 	: rootPath,
		html 	: rootPath,
		images	: rootPath
	}
};

var distribution = generateDestinations( BUILD_FOLDER );
var destination = generateDestinations( DISTRIBUTION_FOLDER );

var imageCrunchOptions = {
	optimizationLevel: 3,
	progressive: false
};

var premailerOptions = {
	mode:'txt'
};

var htmlSquishOptions = {
	removeComments     : !DEBUG,
	collapseWhitespace : !DEBUG,
	minifyCSS          : true,
	keepClosingSlash   : true
};

////////////////////////////////////////////////////////////////////////////////
// Ensure that a directory exists and if it doesn't, create it!
////////////////////////////////////////////////////////////////////////////////
var ensureExists = function(path, mask, cb)
{
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}



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
			.pipe( jade( { pretty:true, debug:false, compileDebug:false } ) )
			.pipe( gulp.dest( destination.html ) )
			.pipe( gulp.dest( distribution.html ) );
});

gulp.task('compile-examples', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	// with sourcemaps all the way down
	return 	gulp.src( source.jade_examples )
			.pipe( jade( { pretty:DEBUG, debug:false, compileDebug:false } ) )
			.pipe( gulp.dest( destination.html ) )
			.pipe( gulp.dest( distribution.html ) );
});

gulp.task('assemble', function () {
    return gulp.src( destination.html +'*.html')
			//.pipe( premailer(premailerOptions) )
			.pipe( htmlmin(htmlSquishOptions) )
			.pipe( gulp.dest( destination.html ) )
			.pipe( gulp.dest( distribution.html ) );
});


// Convert an HTML page into a ENCAPSULATED HTML page
gulp.task('convert', function( cb ){

	var inputDir = path.join( __dirname , destination.html );
	var inputFile = path.join( inputDir, 'email.html' );

	var destinationDir = path.join( __dirname , DISTRIBUTION_FOLDER );
	var destinationFile = path.join( destinationDir, 'email.html' );// load in email

	//if (err) console.log('Creating dir '+destinationDir);// handle folder creation error
  //else console.log('dir creating '+destinationDir);// we're all good

	var styleInliner = new Styliner( inputDir, options );
	var originalSource = fs.readFileSync( inputFile, 'utf8');

	ensureExists( destinationDir, 0744, function(err) {

		styleInliner.processHTML( originalSource ).then( function(processedSource) {

			// save locally as utf8!
			fs.writeFile( destinationFile, processedSource, 'utf8', function (err) {
				//console.log("Writing to file "+destinationFile);
				//console.log(processedSource);
					console.log('Saved ', destinationFile);
					if (err) throw err;
					return cb(err);
			});

		});

	});

});




// Image Tasks ===================================================

// Copy all static images & squish
gulp.task('images', function() {
	return 	gulp.src( source.images)
			//.pipe( newer(destination.images) )
			// Pass in options to the task
			//.pipe( imagemin( imageCrunchOptions ) )
			.pipe( gulp.dest( destination.images ) )
			.pipe( gulp.dest( distribution.images ) );
});

gulp.task('email', function() {

	var email   = require("emailjs/email");

	var server  = email.server.connect({
	   user:    "designerzen@outlook.com",
	   password:"",
	   host:    "smtp-mail.outlook.com",
	   tls: {ciphers: "SSLv3"}
	});

	/*
	var server  = email.server.connect({
	   user:    "designerzen@gmail.com",
	   password:"",
	   host:    "smtp.gmail.com",
		 ssl: 		true
	   //tls: {ciphers: "SSLv3"}
	});
	*/

	var emailDir = path.join( __dirname , DISTRIBUTION_FOLDER );
	var emailFile = path.join( emailDir, 'email.html' );// load in email

	var emailSource = fs.readFileSync( emailFile, 'utf8');

	//console.log(emailSource);

	var message = {
	   text:    "content as attachment",
	   from:    "zen <designerzen@outlook.com>",
	   to:      "jc <john.crickett@flashtalking.com>, zen <designerzen@gmail.com>",
	   cc:      "",
	   subject: "Flashtalking Email test",
	   attachment:
	   [
	      {data:emailSource, alternative:true},
	      //{path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
	   ]
	};

	// send the message and get a callback with an error or details of the message that was sent
	server.send(message, function(err, message) {
		console.log(err || message);
	});

	// you can continue to send more messages with successive calls to 'server.send',
	// they will be queued on the same smtp connection

	// or you can create a new server connection with 'email.server.connect'
	// to asynchronously send individual emails instead of a queue

});



// Cascading Style Sheets ========================================

gulp.task('css', function() {
	var builtEmailFile = path.join( BUILD_FOLDER, 'email.html' );// load in email
	return 	gulp.src( source.styles )
			//.pipe( newer( destination.styles ) )
			// compile less
			.pipe( less( {strictMath: false, compress: true }) )
			// lint
			// squish
			.pipe(uncss({
            html: [	builtEmailFile ]
      }))
			//.pipe( minify() )
			.pipe( gulp.dest( destination.styles ) )
			.pipe( gulp.dest( distribution.styles ) );
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
gulp.task('build', function(callback)
{
	sequencer(
		//'clean',
		[ 'jade', 'images' ],
		'css',
		callback
	);
});

// squish everything & concatanate scripts
gulp.task('deploy', 	[ 'build', 'convert' ] );
gulp.task('distribute', ['deploy'] );

// create a server to host this project
gulp.task('do', function(callback) {
	sequencer(
		'build',
		'convert',
    callback);
});

// create a server to host this project
gulp.task('go', function(callback) {
	sequencer(
		'build',
    callback);
});

// create a server to host this project
gulp.task('serve', 		['images', 'watch'] );

// This creates the examples :)
gulp.task('examples', function(callback) {
	sequencer(
		'clean',
		[ 'css', 'compile-examples', 'images' ],
		'convert',
    callback);
});

// The default task (called when you run `gulp` from cli)
// As many of these tasks are not asynch
gulp.task('default', function(callback) {
	sequencer(
		'clean',
		'build',
		'convert',
    callback);
});
