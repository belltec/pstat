(function () {
  angular.module('pstat')
         .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$log', '$route', '$location'];
  function loginCtrl ($log, $route, $location) {
    var vm = this;

    vm.pageHeader = {
      title: "Political Statistics Engine",
      strapline: "By: Bellwether Technology"
    };

    vm.login = function () {
      $log.debug("You're trying to log in.");
      if (vm.username == "awimley" && vm.password == "1028") {
        $log.debug("Success");
        $location.url('/home')
      }
    };

  }
})()