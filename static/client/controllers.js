var API_URL = 'api/';

var wwwolClient = angular.module('wwwol-client', []);

/**
 * List the {@link Host}
 */
wwwolClient.controller('hostsList', function($scope, $http) {
    $http.get(API_URL + 'hosts').success(function(data) {
        $scope.hosts = data;
    });
});
