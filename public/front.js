var sssComparatorApp = angular.module('sssComparatorApp', []);

// create the controller and inject Angular's $scope
sssComparatorApp.controller('serviceController', function($scope, $http) {

    $scope.lamp = 0

    $scope.clickSwitchLamp = function() {
        var boV = $scope.newBo.boName;
        if (!boV) {
            $scope.addBo = false;
        } else {
            url = '/submitbo/bo' + boV.replace(/\./g, '_') + '.json'
            $http.post(url, $scope.newBoBody).then(function(result) {
                console.log(result.data);
                $scope.clear();
                showMessage('New version ADDED!!!', boV);
                $scope.addBo = false;
            });
        }
    }

    $scope.rmOnBo = function() {
        if ($scope.rmOn) {
            $scope.rmOn = false;
        } else {
            $scope.rmOn = true;
        }
    }

    $scope.clear = function() {
        $scope.service_names = ['rights', 'tickets', 'tariffs', 'parks', 'contracts', 'orders', 'controls', 'fines', 'finesproxy', 'rights_ui', 'tickets_ui', 'contracts_ui', 'tariffs_ui', 'orders_ui', 'frenchfines_ui', 'controls_ui', 'softwaredownloading', 'devicemonitoring']
        $scope.service_env = ['development', 'staging', 'xctwr', 'xct-ui', 'svt2', 'sat1', 'sit0', 'sit1', 'sit2', 'xct1', 'xct2', 'performance'];
        $scope.service_env_ui = [];
        $scope.service_env_ui_saved = ['development', 'staging', 'xctwr', 'xct-ui','svt2', 'sat1', 'sit0', 'sit1', 'sit2', 'xct1', 'xct2', 'performance'];
        $scope.boVs = []
        $scope.rmOn = false;
        $scope.service_env_ui_selected = []

        $scope.s = {};
        $scope.historic = [];
        $scope.saved_suc = false;
        $scope.boVerCheck = 'BO Ver check'
        $scope.newBo = { 'boName': '' }
        $scope.newBoBody = {}
        $scope.addBo = false;
        $scope.file_saved = '';
    }

    $scope.clearBO = function() {
        for (var instIndex = 0; instIndex < $scope.service_env_ui.length; instIndex++) {
            $scope.s[$scope.service_env_ui[instIndex]]['fullMatch'] = false
            for (var i = 0; i < $scope.service_names.length; i++) {
                $scope.s[$scope.service_env_ui[instIndex]][$scope.service_names[i]]['match'] = 'nan'
            }
        }
    }

    $scope.getServices = function() {
        $scope.service_env_ui = $scope.service_env_ui_saved;
        $scope.boVs = []
        for (var i = 0; i < $scope.service_env.length; i++) {
            getEnvsServices($scope.service_env[i]);
        }
        console.log('finished');
    }

    var getEnvsServices = function(env) {
        for (var i = 0; i < $scope.service_names.length; i++) {
            $scope.s[env] = {};
            getService($scope.service_names[i], env);
        }
    }

    var getService = function(service, env) {
        var service_name_api = '/ser/' + service + '/' + env
        $http.get(service_name_api).then(function(result) {
            console.log("Front says -> oooo service arrived")
            $scope.s[env][service] = (result.data);
            console.log(result.data);
        });
    }

    var getDateString = function() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + 'T' + d.getHours() + '_' + d.getMinutes() + '_' + d.getSeconds()
    }

    $scope.save = function() {
        $scope.clearBO();
        var date = getDateString()
        var url = '/save_files/' + date + '.json'
        $http.post(url, JSON.stringify($scope.s)).then(function(result) {
            console.log(result.data)
        }).catch(function(response) {
            console.error("error in posting");
        });
        showMessage('Conf saved', date);
    }

    var showMessage = function(msg, file) {
        $scope.file_saved = file;
        $scope.msgBaner = msg;
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.saved_suc = false;
            });
        }, 3000);
        $scope.saved_suc = true
    }

    $scope.hist = function() {
        if ($scope.historic.length > 0) {
            $scope.historic = [];
        } else {
            $http.get('/save_files').then(function(result) {
                console.log("Retrieving historic data")
                $scope.historic = (result.data);
                console.log(result.data);
            });
        }

    }

    $scope.download = function() {
        $scope.savedJSON = angular.toJson($scope.s, true);
        var blob = new Blob([$scope.savedJSON], {
            type: "application/json;charset=utf-8;"
        });
        var downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', getDateString() + '.json');
        downloadLink.setAttribute('href', window.URL.createObjectURL(blob));
        downloadLink.click();
    }

    $scope.getAndCompare = function(hisItem) {
        url = '/save_files/' + hisItem;
        $http.get(url).then(function(result) {
            console.log("Retrieving historic data")
            formatHisData(hisItem, result.data)
            console.log(result.data);
        });
    }

    var formatHisData = function(fName, resultData) {
        var date = fName.split('.')[0]
        date = date.replace('T', ' ')
        date = date.replace(/_/g, ':')
        date = date.replace(/-/g, '_')
        for (var i = 0; i < $scope.service_env.length; i++) {
            var oldService = $scope.service_env[i] + ' ' + date;
            $scope.s[oldService] = resultData[$scope.service_env[i]];
            $scope.service_env_ui.push(oldService);
        }
        console.log('ready merging');
    }
    $scope.rm = function(index) {
        delete $scope.s[$scope.service_env_ui[index]]
        $scope.service_env_ui.splice(index, 1);
    }

    var clearBoItems = function() {
        for (boV in $scope.boVs) {
            boVName = $scope.boVs[boV]
            delete $scope.s[boVName]
            for (var i = 0; i < $scope.service_env_ui.length; i++) {
                if ($scope.service_env_ui[i] === boVName) {
                    $scope.service_env_ui.splice(i, 1);
                }
            }
        }
        $scope.boVs = [];
    }

    $scope.getBoItems = function() {
        clearBoItems();
        $http.get('/all_bo').then(function(result) {
            console.log("Retrieving bo data")
            console.log(result.data);
            for (var i = 0; i < result.data.length; i++) {
                $scope.getBoItem(result.data[i]);
            }
        });
    }

    $scope.getBoItem = function(boDbName) {
        url = '/bos/' + boDbName;
        $http.get(url).then(function(result) {
            console.log("Retrieving BO Version")
            console.log(result.data);
            boV = boDbName.split('.')[0]
            boV = boV.replace(/_/g, '.')
            $scope.boVs.push(boV);
            $scope.s[boV] = result.data
            $scope.service_env_ui.push(boV);
            $scope.names = result.data
        });
    }

    $scope.boMatch = function(index) {
        var boV = $scope.boVs[index];
        $scope.boVerCheck = boV;
        var boDbName = boV.replace(/\./g, '_')
        url = '/bos/' + boDbName + '.json';
        $http.get(url).then(function(result) {
            console.log("Retrieving BO Version")
            flavorAllAvailableInstances(result.data, boV);
        });
    }
    var flavorAllAvailableInstances = function(boVerFull, boV) {
        for (var i = 0; i < $scope.service_env_ui.length; i++) {
            flavurAllServiceForInstance(i, boVerFull, boV);
        }
        console.log('Changed for All instances')
    }

    var flavurAllServiceForInstance = function(instIndex, boVerFull, boV) {
        var fullMatch = 0
        for (var i = 0; i < $scope.service_names.length; i++) {
            ser = $scope.s[$scope.service_env_ui[instIndex]][$scope.service_names[i]]
            serBo =  boVerFull[$scope.service_names[i]]
            if (ser && serBo) {
                if (ser.version.number === serBo.version.number) {
                    ser['match'] = true
                    fullMatch++;
                } else {
                    ser['match'] = false
                }
            } else {
                //ser['match'] = false
            }
        }
        if (fullMatch == $scope.service_names.length) {
            $scope.s[$scope.service_env_ui[instIndex]]['fullMatch'] = true;
            $scope.s[$scope.service_env_ui[instIndex]]['boV'] = boV
        } else {
            $scope.s[$scope.service_env_ui[instIndex]]['fullMatch'] = false
        }
        console.log('Changed for instance')
    }

    $scope.rmBoV = function(index) {
        var boV = $scope.boVs[index];
        $scope.boVerCheck = boV;
        var boDbName = boV.replace(/\./g, '_')
        url = '/bos/' + boDbName + '.json';
        $http.delete(url).then(function(result) {
            console.log("Deleted BO Version")
            showMessage('Successfully removed', bov);
            $scope.clear();
            $scope.rmOnBo();
        });
    }
    $scope.rmHis = function(index) {
        var hisItem = $scope.historic[index];
        url = '/save_files/' + hisItem;
        $http.delete(url).then(function(result) {
            console.log("Deleted BO Version")
            $scope.hist();
            showMessage('Successfully removed', hisItem);

        });
    }

    $scope.arrangeByName = function() {
        var orderedByServiceName = {}
        $scope.service_env_ui = []
        for (var i = 0; i < $scope.service_env.length; i++) {
            for (env in $scope.s) {
                if (env.includes($scope.service_env[i])) {
                    checkIfMatchWithMain(env, $scope.service_env[i])
                    orderedByServiceName[env] = $scope.s[env]
                    $scope.service_env_ui.push(env)
                }
            }
        }
        $scope.s = orderedByServiceName;
    }

    var checkIfMatchWithMain = function(env, mainEnv) {
        for (var i = 0; i < $scope.service_names.length; i++) {
            if($scope.s[env][ser] && $scope.s[mainEnv][ser]){
                ser = $scope.service_names[i]
                if ($scope.s[env]) {
                    if ($scope.s[env][ser].version.number === $scope.s[mainEnv][ser].version.number) {
                        $scope.s[env][ser]['match'] = true
                    } else {
                        $scope.s[env][ser]['match'] = false
                    }
                }
            }
        }
    }

    $scope.selectEnv = function(env) {
        if ($scope.service_env_ui_selected[env]) {
            delete $scope.service_env_ui_selected[env];
        } else {
            $scope.service_env_ui_selected[env] = true
        }
    }

    $scope.listAndCompareSelected = function() {
        $scope.service_env_ui = []
        for (env in $scope.service_env_ui_selected) {
            $scope.service_env_ui.push(env)
            checkIfMatchWithMain(env, $scope.service_env_ui[0])
        }
    }

});