var sssComparatorApp = angular.module('lampApp', ['ngDesktopNotification']);

// create the controller and inject Angular's $scope
sssComparatorApp.controller('serviceController', function ($scope, $http, desktopNotification, $timeout) {

    $scope.lampSwitch;
    $scope.lamp =false;

    $scope.getLampState = function (service, env) {
        var oldLamState =  $scope.lampSwitch;
        return $http.get('/lampState').then(function (result) {
            console.log("Front says -> oooo service arrived");
            $scope.lamp = result.data.state;
            console.log(result.data);
            $scope.lampSwitch = result.data.state;
            if ($scope.lampSwitch && $scope.lampSwitch ==! oldLamState ) {
                $scope.notif('LampOn.jpg', 'Trwa Call!!!');
            }
            if (!$scope.lampSwitch && $scope.lampSwitch ==! oldLamState){
                $scope.notif('LampOff.jpg', 'Koniec call');
            }
        });

    };


    $scope.notif = function(img, msg) {
        console.log("checking permision");
        return desktopNotification.requestPermission().then(function (permission) {
            // User allowed the notification
            desktopNotification.show('Lampa nadaje:', {
                body: msg,
                // showOnPageHidden: true,
                icon: img,
                onClick: function () {
                    // Handle click event
                }
            });
        }, function (permission) {
            // User denied the notification
            console.log("permision denied");
        });
    };

    $scope.clickSwitchLamp = function () {
        if ($scope.lampSwitch) {
            $http.get('/lampOn').then(function (result) {
                console.log("Lamp ON");
                $scope.lampSwitch = (result.data.state);
                console.log(result.data.state);
            });
           $scope.notif('LampOn.jpg', 'Trwa Call!!!');
        } else {
            $http.get('/lampOff').then(function (result) {
                console.log("Lamp Off");
                $scope.lampSwitch = (result.data.state);
                console.log(result.data.state);
            });
            $scope.notif('LampOff.jpg', 'Koniec call');
        }
    };

    var loadTime = 1000, //Load the data every second
        errorCount = 0, //Counter for the server errors
        loadPromise; //Pointer to the promise created by the Angular $timout service

    var getData = function() {
        $scope.getLampState()
            .then(function(res) {
                errorCount = 0;
                nextLoad();
            })
            .catch(function(res) {
                nextLoad(++errorCount * 2 * loadTime);
            });
    };

    var cancelNextLoad = function() {
        $timeout.cancel(loadPromise);
    };

    var nextLoad = function(mill) {
        mill = mill || loadTime;
        //Always make sure the last timeout is cleared before starting a new one
        cancelNextLoad();
        loadPromise = $timeout(getData, mill);
    };
    //Start polling the data from the server
    getData();
    //Always clear the timeout when the view is destroyed, otherwise it will keep polling and leak memory
    $scope.$on('$destroy', function() {
        cancelNextLoad();
    });
    $scope.data = 'Loading...';


    // desktopNotificationProvider.config({
    //     autoClose: false,
    //     showOnPageHidden: true
    // });

});