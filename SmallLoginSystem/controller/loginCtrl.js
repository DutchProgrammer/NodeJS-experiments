myApp
	.controller('loginCtrl', ['$scope', '$state', '$cookieStore', '$userClass', '$window', 'socket', 
	function ($scope, $state, $cookieStore, $userClass, $window, socket) {
		
		$scope.errorMessage = '';
		$scope.errorType    = 'error';

		$scope.submitForm = function (formController) {
			var emailAddress 	= formController.email.$modelValue,
				password 	 	= formController.password.$modelValue
			;

			$scope.errorMessage = '';
			$scope.errorType    = 'validation';

			if (!formController.$valid || !angular.isString(emailAddress) || !angular.isString(password) ) {
				$scope.errorMessage = 'Enter valid data please';
			} else {
				socket.emit('requestLogin', { 'email' : emailAddress.toString(), 'password' : password.toString() });
			}
		};

		socket.on('loginResult', function (results) {
			$scope.errorType    = 'error';
			$scope.errorMessage = results.message;

			if (results.status === 'ok') {
				$scope.errorType = 'success';

				var loginSession 		= results.user;
					loginSession.login 	= true;

				$userClass.saveLogin(loginSession);

				setTimeout(function () {
					$window.location.href = '/'
					$window.location.reload();
				}, 3000);
			}

			$scope.$apply();
		});
	}])
; 