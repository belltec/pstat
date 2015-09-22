(function () {
  
angular.module('pstat',['ngRoute', 'ngSanitize', 'ui.bootstrap', 'LocalStorageModule', 'n3-line-chart', 'infinite-scroll']);

config.$inject = ['$routeProvider', '$locationProvider', 'localStorageServiceProvider'];
function config ($routeProvider, $locationProvider, localStorageServiceProvider) {
  
  angular.module("infinite-scroll").value("THROTTLE_MILLISECONDS", 200);
  $routeProvider
    .when('/', {
      templateUrl: '/login/login.view.html',
      controller: 'loginCtrl',
      controllerAs: 'vm'
    })
    .when('/home' , {
      templateUrl: "/home/home.view.html",
      controller: 'homeCtrl',
      controllerAs: 'vm'
    })
    .otherwise({redirectTo: '/'});

    //remove gnarly /#/ from html route
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    //Configure local storage
    localStorageServiceProvider
      .setStorageType('localStorage');
}

angular
  .module('pstat')
  .config(['$routeProvider', '$locationProvider', 'localStorageServiceProvider', config]);
})();