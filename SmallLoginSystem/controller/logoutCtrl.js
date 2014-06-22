myApp
.controller('logoutCtrl', ['$scope', '$state', '$userClass', '$window',
function ($scope, $state, $userClass, $window) {

	$userClass.logout();

	$window.location.href = '/'
	$window.location.reload();
}])
;