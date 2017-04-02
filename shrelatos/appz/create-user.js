
/* @ngInject */

app.controller("createUserCtrl",['$scope','userService',function($scope,userService){
	
	var self = $scope;
	self.userDto = {
		user : "",
		password : "",
		roles : "USER",
		creationdate : 0
	};
	
	self.repeatPass = "";
	
	self.checkRepeat = function()
	{
		var disable = true;
		if(self.userDto.password !== self.repeatPass){
			disable = true;
		}else {
			if(self.repeatPass === "")
				disable = true;
			else
				disable = false;
		}
		return disable;
	};
	
	self.addUser = function(){
		userService.addUser(self.user).then(function(data){
			console.log("ADDED");
		}).catch(function(err)
		{
			console.log(err);
		});
	};
	
	
	
}]);

app.factory("userService",["$http","$q",function($http,$q){
	
	return {
		
		addUser: function(user)
		{
			var defered = $q.defer();
		    var promise = defered.promise;
		    
		    $http.get('/api/addUser.rest',user).
			success(function(data, status, headers, config) 
			{
				defered.resolve(data);
			}).
			error(function(data, status, headers, config) 
			{
				defered.reject(data);
			});

			return promise;
		    
		}
		
	};
	
	
}]);