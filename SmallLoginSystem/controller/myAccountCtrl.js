myApp
.controller('myAccountCtrl', ['$scope', '$state', '$userClass',
function ($scope, $state, $userClass) {

	$scope.user   = $userClass.getUser();
	$scope.myRole = $userClass.getUserRole();

	$scope.submitForm = function(formController) {

		var name 			= formController.name.$modelValue || false,
			emailAddress 	= formController.email.$modelValue || false,
			password 	 	= formController.password.$modelValue || false,
			confirmPassword = formController.confirmPassword.$modelValue || false
		;

		$scope.errorMessage = '';
		$scope.errorType    = 'validation';

		if (!formController.$valid || !angular.isString(emailAddress) ||  !angular.isString(name) /* || !angular.isString(password) || !angular.isString(confirmPassword) */ ) {
			$scope.errorMessage = 'Enter valid data please';
		} else if (password && !angular.equals(password, confirmPassword) ) {
			$scope.errorMessage = 'Passwords not equals';
		} else {
			var changeData = {
				'id' 	: parseInt($userClass.getUserId()), 
				'name'  : name.toString(), 
				'email' : emailAddress.toString()
			};

			if (password ) {
				changeData.password = password.toString()
			}

			socket.emit('requestChangeAccount', changeData);
		}
	};



	socket.on('changeAccountResult', function (results) {
		console.info('changeAccountResult', results);

		$scope.errorType    = 'error';
		$scope.errorMessage = results.message;

		if (results.status === 'ok') {
			$scope.errorType = 'success';

			$userClass.saveUserName(results.user.name);
			$userClass.saveUserEmail(results.user.email);
		}

		$scope.$apply();
	});
}])
;