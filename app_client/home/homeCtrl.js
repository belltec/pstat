(function() {
  angular.module("pstat")
         .controller("homeCtrl", homeCtrl);

  homeCtrl.$inject = ['$log', 'dataService', 'localStorageService', '$http'];
  function homeCtrl ($log, dataService, localStorageService, $http) {
    var vm = this;
    vm.query = {};
    
    //Variables for the query builder
    vm.queries = 0;
    vm.repQueries = [];

    vm.displayData = [];
    vm.displayKeys = [];
    vm.limit = 1500;
    vm.search = "";
    vm.loading = false;
    vm.page = 1;
    vm.pages = 0; //Keep track for pagination reasons.
    vm.ngRepStart = 1;
    vm.ngRepEnd = 100;
    vm.fields = { //Converts the keys from data into
      "LastVoted" : "Last Voted",
      "Mail_Address1" : "Address",
      "Mail_ZipCode5": "Zip Code",
      "Mail_City" : "City",
      "Personal_Age" : "Age",
      "Personal_FirstName": "First Name",
      "Personal_LastName": "Last Name",
      "Jurisdiction_Precinct": "Precinct",
      "Jurisdiction_Ward": "Ward",
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
      title: "Political Statistics Engine v0.2",
      strapline: "Lousiana Voters"
    };

    vm.next = function () {
      console.log(angular.element(".infScroll").scrollTop(0));
      vm.err = "";
      vm.page += 1;
      var start = vm.page*100 - 99;
      var end = vm.page*100;
      var data = vm.data;
      vm.displayData = data.slice(start, end);

      //Display purposes
      vm.ngRepStart = start;
      vm.ngRepEnd = end;
    };

    vm.prev = function () {
      vm.err = "";
      if (vm.page == 1) {
        vm.err = "You are on page 1.";
      } else {
        vm.page -= 1;
        var start = vm.page*100 - 99;
        var end = vm.page*100;
        var data = vm.data;
        vm.displayData = data.slice(start, end);

        //Display purposes
        vm.ngRepStart = start;
        vm.ngRepEnd = end;
      }
    };

    vm.initiation = function (vr) {
      vm.query[vr] = new Object();
    };

    vm.giveMeData = function () {
      //Use data service here, route '/jsonData', query: MongoDB default.
      vm.error = ""; //Lets prepare for catching errors.   

      vm.page = 1; //Reinitialize data viewer

      console.log("We are sending $http req to backend.");

      console.log(vm.query);

      vm.loading = true;
      dataService.jsonData(vm.query, vm.limit)
      .success (function (data) {
        vm.loading = false;
        vm.data = data;

        vm.count = data.length;
        vm.pages = vm.count / 100;
        if (vm.count < 100) {
          vm.ngRepEnd = vm.count;
        }

        vm.displayData = data.slice(1, 100);
        if (vm.data[0]) {
          vm.keys = Object.keys(vm.data[0]);
        } else {
          vm.error = "Your search returned 0 results.";
        }
        //After the first loading loop, load WAY more results. user shouldn't notice since page 1 is up. Call for 1000 takes ~2.5 seconds with no query.
        //Search time goes up exponentially with new queries, and logarithmic with the number of searched records. MAX FOR 1000: probably ~10s
        //THIS SHOULD BE TRANSPARENT TO USER.
        //BENCHMARKING REQUIRED

      })
      .error (function (err) {
        vm.loading = false;
        $log.debug(err);
        vm.error = err;
      });
    };

    vm.addQuery = function () {
      console.log("Adding queries");
      vm.queries += 1;
      vm.repQueries.push(vm.queries);
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