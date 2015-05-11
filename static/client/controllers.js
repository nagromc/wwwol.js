var API_URL = 'api/';

var wwwolClient = angular.module('wwwol-client', []);

/**
 * List the {@link Host}
 */
wwwolClient.controller('hostsList', ['$scope', '$http', function($scope, $http) {
    var refreshHostList = function () {
        $http.get(API_URL + 'hosts').success(function(data) {
            $scope.hosts = data;
        });
    };

    refreshHostList();

    $scope.wakeup = function(hostid) {
        console.log('User clicked on wake up button. hostid=' + hostid);
        $http.post(API_URL + 'wakeup', {hostid: hostid}).
            success(function(data) {
                if (data.response) {
                    console.log('Host [hostid=' + hostid + '] has been switched on.');
                } else {
                    console.log('Host [hostid=' + hostid + '] could not be switched on.');
                }
            }).
            error(function() {
                console.error('Error calling wakeup API');
            });
    };

    $scope.remove = function(hostid) {
        console.log('User clicked on remove button. hostid=' + hostid);
        $http.delete(API_URL + 'host/' + hostid).
            success(function(data) {
                if (data.response) {
                    console.log('Host [hostid=' + hostid + '] has been removed.');
                    refreshHostList();
                } else {
                    console.log('Host [hostid=' + hostid + '] could not be removed.');
                }
            }).
            error(function() {
                console.error('Error calling remove host API');
            });
    };
}]);

