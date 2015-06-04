'use strict';

angular.module('baseangular', ['ngAnimate', 'ngCookies', 'ngSanitize', 'restangular', 'ui.router'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('home.test1', {
        url: 'home/test1',
        templateUrl: 'app/main/block.html'
      })
      .state('home.test2', {
        url: 'home/test2',
        templateUrl: 'app/main/circle.html'
      })
      .state('Guinea Pig', {
        url: '/GP',
        templateUrl: 'app/GP/GP.html',
        controller: 'GPCtrl'
      })
      .state('Hamster', {
        url: '/Hamster',
        templateUrl: 'app/hamster/hamster.html',
        controller: 'HmstrCtrl'
      })
      .state('Mouse', {
        url: '/Mouse',
        templateUrl: 'app/mouse/mouse.html',
        controller: 'MouseCtrl'
      });

      //Access states in html via `ui-sref={stateName}`

    $urlRouterProvider.otherwise('/');
  })
;
