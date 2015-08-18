(function () {
  angular.module('pstat')
         .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$log', '$route', '$location', 'dataService', 'localStorageService'];
  function loginCtrl ($log, $route, $location, dataService, localStorageService) {
    var vm = this;

    vm.pageHeader = {
      title: "Political Statistics Engine",
      strapline: "By: Bellwether Technology"
    };

    vm.login = function () {
      $log.debug("You're trying to log in.");
      if (vm.username == "awimley" && vm.password == "10281787") {
        $log.debug("Success");
        $location.url('/home');
        
      }
    };
  }
})()