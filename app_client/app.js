(function () {
  
angular.module('pstat',['ngRoute', 'ngSanitize', 'ui.bootstrap', 'LocalStorageModule', 'n3-line-chart']);

config.$inject = ['$routeProvider', '$locationProvider', 'localStorageServiceProvider'];
function config ($routeProvider, $locationProvider, localStorageServiceProvider) {
  
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
    $locationProvider.html5Mode(true);

    //Configure local storage
    localStorageServiceProvider
      .setStorageType('localStorage');
}

angular
  .module('pstat')
  .config(['$routeProvider', '$locationProvider', 'localStorageServiceProvider', config]);
})();