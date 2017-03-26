

var app = angular.module('relatos', ['ui.router']);

/* @ngInject */
app.config(function($stateProvider) {
	
	  var newRelato = {
	    name: 'newRelato',
	    url: '/new',
	    templateUrl: 'views/create-rel.html',
	    controller : "createRelCtrl"
	  }

	  var aboutState = {
	    name: 'about',
	    url: '/about',
	    template: '<h3>Its the UI-Router hello world app!</h3>'
	  }

	  $stateProvider.state(newRelato);
	  $stateProvider.state(aboutState);
});