(function() {
  angular.module("pstat")
         .controller("homeCtrl", homeCtrl);

  homeCtrl.$inject = ['$log', 'dataService', 'localStorageService', '$http'];
  function homeCtrl ($log, dataService, localStorageService, $http) {
    var vm = this;
    vm.query = {};
    vm.displayKeys = [];
    vm.limit = 100;
    vm.search = "";

    var up = function (item) {
      return item.toUpperCase();
    };

    //Get meta data on init
    dataService.getMeta() 
    .success( function (data) {
      vm.meta = data;
      console.log(vm.meta);
    })
    .error ( function (err ){
      vm.error = err;
    });

    vm.header = {
      title: "Political Statistics Engine v0.1",
      strapline: "Lousiana Voters"
    };

    vm.initiation = function (vr) {
      vm.query[vr] = new Object();
    };

    vm.insensitive = function (actual, expected) { //If any case of one is equal to the other...
      return (actual == expected || actual.toUpperCase() == expected || actual.toLowerCase() == expected || actual == expected.toUpperCase() || actual == expected.toLowerCase());
    };

    vm.loadMore = function () {
      console.log("We're loading more.");
      vm.limit += 100;
    };

    vm.giveMeData = function () {
      //Use data service here, route '/jsonData'
      /*if (vm.query.Personal_FirstName) {
        vm.query.Personal_FirstName.$regex = vm.query.Personal_FirstName.$regex;// turn EQUALS to CONTAINS via regex literal
      }*/

      if (vm.query.Personal_LastName) {
        vm.query.Personal_LastName.$eq = up(vm.query.Personal_LastName.$eq);
      }
      
      console.log("We are sending $http req to backend.");

      console.log(vm.query);
      dataService.jsonData(vm.query, vm.limit)
      .success (function (data) {
        vm.data = data;
        if (vm.data) {
          vm.keys = Object.keys(vm.data[0]);
        }

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
    };
  }

})()