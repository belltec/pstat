(function() {
  angular.module("pstat")
         .controller("homeCtrl", homeCtrl);

  homeCtrl.$inject = ['$log', 'dataService', 'localStorageService', '$http'];
  function homeCtrl ($log, dataService, localStorageService, $http) {
    var vm = this;
    vm.query = {};
    vm.displayKeys = [];

    //NEED ALG THAT DESTROYS THE PLAGUE OF NULLS

    //Get meta data on init
    dataService.getMeta() 
    .success( function (data) {
      vm.meta = data;
      console.log(vm.meta);
    })
    .error ( function (err ){
      vm.error = err;
    })

    vm.header = {
      title: "Political Statistics Engine v0.1",
      strapline: "Lousiana Voters"
    };

    vm.initiation = function (vr) {
      vm.query[vr] = new Object();
    };

    vm.giveMeData = function () {
      //Use data service here, route '/jsonData'
      console.log("We are sending $http req to backend.");

      console.log(vm.query);
      dataService.jsonData(vm.query)
      .success (function (data) {
        vm.data = data;
        vm.keys = Object.keys(vm.data[0]);

        //Making headers more display friendly
        angular.forEach(vm.keys, function (v, k) {
          var newValue = v.replace("_", "\n");
          vm.displayKeys.push(newValue);
          $log.debug(v);
        });
        $log.debug(vm.displayKeys);
      })
      .error (function (err) {
        $log.debug(err);
      });
    };

    vm.giveMeMeta = function () {
      console.log("Time to get META..");
      dataService.getMeta()
      .success( function (data) {
        console.log(data);
      })
      .error( function (err) {
        console.log(err);
      })
    }
  }

})()