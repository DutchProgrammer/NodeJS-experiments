'use strict';

var socket = io.connect(),
	myApp  = angular.module('myApp', [
	'ui.router', 'ngCookies'
])
.constant('MyAppName', 'Small loginSystem')
.constant('socket', socket)
.constant('USERROLES', {
	all: 	    '*',
	admin:     'admin',
	member:    'member',
	isLogin:   'isLogin',
	notLogin:  'notLogin'
})
.factory('$userClass', [ '$cookieStore', '$rootScope', 'USERROLES',  function($cookieStore, $rootScope, USERROLES) {
     
    var userCookie = $cookieStore.get('user') || false;

	var userClass = {
		userCookie: userCookie ,
		isLogin : function () {
			console.log(this.userCookie, 'isLogin');

			if (this.userCookie && this.userCookie.login) {
				return true;
			}

			return false;
		},
		hasAccess: function (needRole) {
			if (!angular.isArray(needRole)) {
				needRole = [needRole];
			}

			if (needRole.indexOf(USERROLES.all) !== -1) {
				return true;
			} else if (needRole.indexOf(USERROLES.isLogin) !== -1) {
				return this.isLogin();
			} else if (needRole.indexOf(USERROLES.notLogin) !== -1) {
				return !this.isLogin();
			}

			return (this.isLogin() && needRole.indexOf(this.getUserRole()) !== -1);
		},
		saveLogin : function (data) {
			console.log(this, 'saveLogin this');
			console.info('saveLogin', data);

			if (this.isLogin()) {
				console.log('saveLogin no isLogin');
				return false;
			}

			$cookieStore.remove('user');
			$cookieStore.put('user', data);
			this.userCookie = data;
			return true;
		},
		getUser: function() {
			if (!this.isLogin()) {
				return false;
			}
			return this.userCookie;
		},
		getUserId: function () {
			if (!this.isLogin()) {
				return false;
			}
			return this.userCookie.id;
		},
		getUserName: function () {
			if (!this.isLogin()) {
				return false;
			}
			return this.userCookie.name;
		},
		saveUserName: function (newName) {
			if (!this.isLogin()) {
				return false;
			}

			var user 	  = this.getUser();
				user.name = newName.toString();
			console.log(user, 'saveUserName');

			return this.saveLogin(user);
		},
		getUserEmail: function () {
			if (!this.isLogin()) {
				return false;
			}
			return this.userCookie.email;
		},
		saveUserEmail: function (newName) {
			if (!this.isLogin()) {
				return false;
			}

			var user 	  = this.getUser();
				user.email = newName.toString();

			return this.saveLogin(user);
		},
		getUserRole: function () {
			if (!this.isLogin()) {
				return false;
			}
			return this.userCookie.role;
		},
		logout: function () {
			if (!this.isLogin()) {
				return false;
			}
			$cookieStore.remove('user');

			return true;
		}
	};

	$rootScope.$broadcast('$userClass',userClass);

 	return userClass;
}])
.controller('appCtrl', [ '$scope', 'USERROLES', '$userClass' , function ($scope, USERROLES, $userClass) {

	$scope.$userClass  = $userClass;
	$scope.isLogin     = $userClass.isLogin();
	$scope.currentUser = $userClass.getUser();
	$scope.userRoles   = USERROLES;
	$scope.hasAccess   = $userClass.hasAccess;
}])
.config(['$urlRouterProvider', '$stateProvider', 'USERROLES', function ($urlRouterProvider, $stateProvider, USERROLES) {
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			pageName: 'Login and Register experiment',
			url: '/',
			templateUrl: 'views/home.html',
			controller: 'homeCtrl',
		    data: {
		    	authorizedRoles: [USERROLES.all]
		    }
		})
		.state('login', {
			pageName: 'login',
			url: '/login',
			templateUrl: 'views/login.html',
			controller: 'loginCtrl',
		    data: {
		    	authorizedRoles: [USERROLES.notLogin],
		    	redirectTo: 'home'
		    }
		})
		.state('signup', {
			pageName: 'signup',
			url: '/signup',
			templateUrl: 'views/signup.html',
			controller: 'signupCtrl',
		    data: {
		    	authorizedRoles: [USERROLES.notLogin],
		    	redirectTo: 'home'
		    }
		})

		.state('myAccount', {
			pageName: 'myAccount',
			url: '/myAccount',
			templateUrl: 'views/myAccount.html',
			controller: 'myAccountCtrl',
		    data: {
		    	authorizedRoles: [USERROLES.isLogin],
		    	redirectTo: 'login'
		    }
		})
		.state('myFriends', {
			pageName: 'myFriends',
			url: '/myFriends',
			templateUrl: 'views/myFriends.html',
			controller: 'myFriendsCtrl',
		    data: {
		    	authorizedRoles: [USERROLES.isLogin],
		    	redirectTo: 'login'
		    }
		})
		.state('adminPage', {
			pageName: 'adminPage',
			url: '/adminPage',
			templateUrl: 'views/adminPage.html',
			controller: 'adminPageCtrl',
		    data: {
		    	authorizedRoles: [USERROLES.isLogin, USERROLES.admin],
		    	redirectTo: 'home'
		    }
		})
		.state('logout', {
			pageName: 'logout',
			url: '/logout',
			templateUrl: 'views/logout.html',
			controller: 'logoutCtrl',
		    data: {
		    	authorizedRoles: [USERROLES.isLogin],
		    	redirectTo: 'home'
		    }
		})
	;
}])
.run(['$state', '$userClass', '$rootScope', '$document', 'MyAppName', function($state, $userClass, $rootScope, $document, MyAppName) {
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

		$document[0].title = toState.pageName+' - '+MyAppName;

		var authorizedRoles = toState.data.authorizedRoles;
		console.log(toState, 'toState');
		console.log($userClass.isLogin(), 'isLogin');
		console.log($userClass.hasAccess(authorizedRoles), 'hasAccess');

		if (!$userClass.hasAccess(authorizedRoles)) {
			e.preventDefault();
			console.error('no Access to this page !');
			var redirectTo = toState.data.redirectTo || false;

			if (redirectTo) {
				$state.transitionTo(redirectTo);	
			}
		}
    });
}])
;