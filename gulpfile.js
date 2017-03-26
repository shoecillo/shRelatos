
var gulp = require('gulp');
var connect = require('gulp-connect');
var proxy = require('http-proxy-middleware');
var modRewrite = require('connect-modrewrite');
var path = require('path');
var child_process = require('child_process');
var protractor = require("gulp-protractor").protractor;
var webdriver_update = require('gulp-protractor').webdriver_update;
var protractorQA = require('gulp-protractor-qa');

var minifyHTML = require('gulp-html-minifier'),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	cssmin = require("gulp-clean-css"),
	sourcemaps = require("gulp-sourcemaps"),
	ngAnnotate = require('gulp-ng-annotate'),
	clone = require('gulp-clone'),
	gzip = require('gulp-gzip'),
	zip = require('gulp-zip'),
	argv = require('yargs').argv,
	ngHtml2Js = require("gulp-ng-html2js"),
	ignore = require("gulp-ignore"),
	ghtmlSrc = require('gulp-html-src'),
	gulpif = require('gulp-if'),
	runSequence = require('run-sequence'),
	filelog = require('gulp-filelog');
	clean = require('gulp-clean');
	processhtml = require('gulp-processhtml');


var config = {
	paths : {
		html : {
			src : 'shrelatos/index.html',
			srcPartials : 'shrelatos/views/**.html',
			dest : 'dest/shrelatos'
		},
		javascript : {
			src : 'shrelatos/appz/**.js',
			dest : 'dest/shrelatos/appz'
		},
		css : {
			src : 'shrelatos/css/**.css',
			dest : 'dest/shrelatos/css'
		}
	},
	host : {
		dev : true,
		prod : true
	}
};


gulp.task("html", function() {
	return gulp.src(config.paths.html.src)
		.pipe(processhtml())
		.pipe(minifyHTML({
			empty : true,
			spare : true,
			quotes : true
		}))
		.pipe(gulp.dest(config.paths.html.dest));
});

gulp.task("htmlPartials", function() {
	var task = gulp.src(config.paths.html.srcPartials)
		.pipe(minifyHTML({
			empty : true,
			spare : true,
			quotes : true
		}))
		.pipe(ngHtml2Js({
			moduleName : "relatos",
		}))
		.pipe(concat("partials.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest(config.paths.javascript.dest));

	task.pipe(clone())
		.pipe(ignore.exclude('**.map'))
		.pipe(gzip())
		.pipe(gulp.dest(config.paths.javascript.dest));
	return task;
});



gulp.task("scripts-dist", function() {
	var filesJs = [];
	var task = gulp.src(config.paths.javascript.src)
		.pipe(ngAnnotate({
			remove : false,
			add : true,
			single_quotes : true
		}))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(concat("appz.min.js"))
		.pipe(sourcemaps.write('.', {
			sourceMappingURL : function(file) {
				console.log(file)
				return '/shrelatos/appz/' + file.relative + '.map';
			}
		}))
		.pipe(gulp.dest(config.paths.javascript.dest));


	return task;
});



gulp.task("css", function() {

	var task = gulp.src(config.paths.css.src)
		.pipe(sourcemaps.init())
		.pipe(cssmin({
			keepSpecialComments : 0
		}))
		.pipe(concat('app.min.css'))
		.pipe(sourcemaps.write('.', {
			sourceMappingURL : function(file) {
				return '/shrelatos/css/' + file.relative + '.map';
			}
		}))
		.pipe(gulp.dest(config.paths.css.dest));

	return task;
});

gulp.task('copy-fonts-dest', function() {
	gulp.src([ './shrelatos/fonts/**/*' ])
		.pipe(gulp.dest('./dest/shrelatos/fonts'));
});

gulp.task('copy-libs-dest', function() {
	gulp.src([ './shrelatos/jsLib/**/*' ])
		.pipe(gulp.dest('./dest/shrelatos/jsLib'));
});

gulp.task('copy-views-dest', function() {
	gulp.src([ './shrelatos/views/**/*' ])
		.pipe(gulp.dest('./dest/shrelatos/views'));
});

gulp.task("zip", () => gulp.src('./dest/**')
	.pipe(zip('shrelatos.zip'))
	.pipe(gulp.dest('dest'))
);

gulp.task('clean', function () {
    return gulp.src('dest', {read: false})
        .pipe(clean());
});

gulp.task("copy-dest", [ "copy-fonts-dest", "copy-libs-dest", "copy-views-dest" ]);
gulp.task("min", [ "scripts-dist", "css", "html" ]);


gulp.task('build', function(callback) {
	runSequence("clean",
			"copy-dest",
			[ "scripts-dist", "css", "html" ],
			callback);
});


// SERVER CONFIG AND TESTING PROTRACTOR

var rutas = [
	"./shrelatos/",
	"./test/js/fixtures/"
];

var rutasE2E = [
	"./shrelatos/",
	"./test/js/fixtures/"
];



var mReWrite = function(port) {
	return [
		'^/shrelatos/(.*)$ http://localhost:' + port + '/$1 [P]',
		'^/shrelatos/(.*)$ http://localhost:' + port + '/$1 [P]'
	];
}

gulp.task('frontDev', [ 'webserver', 'livereload', 'watch' ]);

gulp.task('webserver', function() {
	connect.server({
		root : rutas,
		debug : true,
		port : 8000,
		livereload : true,
		middleware : function(connect, opt) {
			return [
				modRewrite(mReWrite(8000))
			]
		}
	});

});

gulp.task('watch', function() {
	gulp.watch([ 'shrelatos/**/**/*',
	], [ 'livereload' ]);
});

gulp.task('livereload', function() {
	gulp.src(rutas)
		.pipe(connect.reload());
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

gulp.task('webserverE2E', function() {
	connect.server({
		root : rutasE2E,
		debug : true,
		port : 8001,
		middleware : function(connect, opt) {
			return [
				modRewrite(mReWrite(8001))
			]
		}
	});

});

gulp.task('protractor', [ "webdriver_update" ], function(cb) {

	gulp.src([ "./test/js/e2e/*.js" ])
		.pipe(protractor({
			configFile : "protractor.conf.js",
			args : [ '--baseUrl', 'http://localhost:8000' ]
		}))
		.on('error', function(e) {
			connect.serverClose();
			console.error("Error generado " + e);
			throw e;
		}).on('end', cb);

});

gulp.task('e2e', [ 'webserverE2E', 'protractor' ], function() {
	console.log("Cerrando el servidor mock")
	connect.serverClose();
});


gulp.task('protractor-qa', function() {
	protractorQA.init({
		runOnce : true, // optional 
		testSrc : './test/js/e2e/*.js',
		viewSrc : [ './shrelatos/index.html' ]
	});
});

gulp.task('copy-js-libs', function() {
	gulp.src([ './node_modules/angular/angular.min.js',
		'./node_modules/bootstrap/dist/js/bootstrap.min.js',
		'./node_modules/jquery/dist/jquery.min.js',
		'./node_modules/angular-ui-router/release/angular-ui-router.min.js' ])
		.pipe(gulp.dest('./shrelatos/jsLib'));
});

gulp.task('copy-css', function() {
	gulp.src([ './node_modules/bootstrap/dist/css/bootstrap.css',
		'./node_modules/bootstrap/dist/css/bootstrap.css.map',
		'./node_modules/bootstrap/dist/css/bootstrap-theme.css',
		'./node_modules/bootstrap/dist/css/bootstrap-theme.css.map',
		'./node_modules/font-awesome/css/font-awesome.min.css' ])
		.pipe(gulp.dest('./shrelatos/css'));
});

gulp.task('copy-fonts', function() {
	gulp.src([ './node_modules/bootstrap/dist/fonts/**/*',
		'./node_modules/font-awesome/fonts/**/*' ])
		.pipe(gulp.dest('./shrelatos/fonts'));
});

gulp.task('copy-libs', [ 'copy-js-libs', 'copy-css', 'copy-fonts' ]);