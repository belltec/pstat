(function () {
  angular.module('pstat')
         .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$log', '$route', '$location', 'dataService', 'localStorageService'];
  function loginCtrl ($log, $route, $location, dataService, localStorageService) {
    var vm = this;
    vm.token = localStorageService.get("token");
    if (vm.token) {
      dataService.verifyUser(vm.token)
      .success( function (data) {
        console.log(data);
      })
      .error ( function (err) {
        console.log(err);
      });
    }

    vm.pageHeader = {
      title: "Political Statistics Engine",
      strapline: "By: Bellwether Technology"
    };

    vm.login = function () {
      $log.debug("You're trying to log in.");
      dataService.tryLogin({
        user: vm.username,
        password: vm.password
      })
      .success( function (data) {
        localStorageService.set("token", data);
        $location.url('/home');
      })
      .error( function (err) {
        vm.res = err;
      });
    };
  }
})()