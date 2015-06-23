'use strict';

angular.module('baseangular')
  .directive('example', function () {
    return {
      restrict: 'A',
      templateUrl: 'xyz.html'
    };
  });
