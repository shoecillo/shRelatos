//jshint strict: false

module.exports = function(config) {
	config.set({
		basePath: './',
		files : [
		         "src/main/webapp/static/jsLib/angular.min.js",
		         "src/main/webapp/static/jsLib/angular-cookies.min.js",
		         "src/main/webapp/static/jsLib/ui.bootstrap.min.js",
		         "src/main/webapp/static/script/services/main.js",
		         "src/main/webapp/static/script/app.js",
		         "src/test/javascript/fixtures/*.js"
		],
		 autoWatch: false,
		    frameworks: ['jasmine'],
		    browsers: ['Chrome'],
		    singleRun: true,
		    plugins: [
		      'karma-chrome-launcher',
		      'karma-firefox-launcher',
		      'karma-ie-launcher',
		      'karma-jasmine'
		      ]
	});	
};