myApp
	.controller('signupCtrl', ['$scope', '$state', 'socket', 'MyAppName', 
	function ($scope, $state, socket, MyAppName) {
		
		$scope.errorMessage = '';
		$scope.errorType    = 'error';

		$scope.submitForm = function (formController) {
			var name 			= formController.name.$modelValue,
				emailAddress 	= formController.email.$modelValue,
				password 	 	= formController.password.$modelValue,
				confirmPassword = formController.confirmPassword.$modelValue
			;

			$scope.errorMessage = '';
			$scope.errorType    = 'validation';

			if (!formController.$valid || !angular.isString(emailAddress) ||  !angular.isString(name) || !angular.isString(password) || !angular.isString(confirmPassword) ) {
				$scope.errorMessage = 'Enter valid data please';
			} else if (!angular.equals(password, confirmPassword) ) {
				$scope.errorMessage = 'Passwords not equals';
			} else {
				socket.emit('requestsignup', { 'name' : name.toString(), 'email' : emailAddress.toString(), 'password' : password.toString() });
			}
		};

		socket.on('signupResult', function (results) {
			$scope.errorType    = 'error';
			$scope.errorMessage = results.message;

			if (results.status === 'ok') {
				$scope.errorType = 'success';
			}

			$scope.$apply();
		});
	}])
; 