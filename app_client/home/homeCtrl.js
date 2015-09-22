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
    vm.loading = false;
    vm.fields = {
      "LastVoted" : "Last Voted",
      "Mail_Address1" : "Address",
      "Mail_ZipCode5": "Zip Code",
      "Mail_City" : "City",
      "Personal_Age" : "Age",
      "Personal_FirstName": "First Name",
      "Personal_LastName": "Last Name",
      "Registration_PoliticalPartyCode": "Party"
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

    vm.loadMore = function () {
      console.log("We're loading more.");
      vm.limit += 100;

      //Precall loading vm object
      vm.loading = true;
      dataService.jsonData(vm.query, vm.limit)
      .success (function (data) {
        vm.loading = false;
        vm.data = data;
        if (vm.data[0]) {
          vm.keys = Object.keys(vm.data[0]);
        } else {
          vm.error = "Your search returned 0 results.";
        }
      })
      .error (function (err) {
        vm.loading = false;
        $log.debug(err);
        vm.error = err;
      });

    };

    vm.giveMeData = function () {
      //Use data service here, route '/jsonData', query: MongoDB default.
      vm.error = ""; //Lets prepare for catching errors.      
      console.log("We are sending $http req to backend.");

      console.log(vm.query);

      vm.loading = true;
      dataService.jsonData(vm.query, vm.limit)
      .success (function (data) {
        vm.loading = false;
        vm.data = data;
        if (vm.data[0]) {
          vm.keys = Object.keys(vm.data[0]);
        } else {
          vm.error = "Your search returned 0 results.";
        }
      })
      .error (function (err) {
        vm.loading = false;
        $log.debug(err);
        vm.error = err;
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