var sssComparatorApp = angular.module('lampApp', []);

// create the controller and inject Angular's $scope
sssComparatorApp.controller('serviceController', function($scope, $http) {
    $scope.getLampState = function (service, env) {
        $http.get('/lampState').then(function (result) {
            console.log("Front says -> oooo service arrived")
            $scope.lamp = result.data.state;
            console.log(result.data);
            return result.data.state
        });
    };

    $scope.lamp = $scope.getLampState();



    $scope.clickSwitchLamp = function () {
        if ($scope.lamp==0) {
            $http.get('/lampOn').then(function (result) {
                console.log("Lamp ON");
                $scope.lamp = (result.data.state);
                console.log(result.data.state);
            });
        } else {
            $http.get('/lampOff').then(function (result) {
                console.log("Lamp Off");
                $scope.lamp = (result.data.state);
                console.log(result.data.state);
            });
        }
    }

})