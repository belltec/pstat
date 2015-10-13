(function() {
  angular.module("pstat")
         .controller("homeCtrl", homeCtrl);

  homeCtrl.$inject = ['$log', 'dataService', 'localStorageService', '$http'];
  function homeCtrl ($log, dataService, localStorageService, $http) {
    var vm = this;
    vm.query = new Object(); //Main query object
    
    //Variables for the query builder and query loading message
    vm.queries = 0;
    vm.qArray = [];
    vm.loading = false;

    //Arbitrary variables and conversion matrices
    vm.displayData = [];
    vm.displayKeys = [];
    vm.limit = 1500;
    vm.search = "";
    vm.loading = false;
    vm.page = 1;
    vm.pages = 0; //Keep track for pagination reasons.
    vm.ngRepStart = 1;
    vm.ngRepEnd = 100;

                  // Translation objects
    vm.fields = { // Converts the keys from data into simpler names for the user
      "LastVoted" : "Last Voted",
      "Mail_Address1" : "Mailing Address",
      "Mail_ZipCode5": "Mail Zip Code",
      "Mail_City" : "City",
      "Personal_Age" : "Age",
      "Personal_FirstName": "First Name",
      "Personal_LastName": "Last Name",
      "Jurisdiction_Precinct": "Precinct",
      "Jurisdiction_Ward": "Ward",
      "Registration_PoliticalPartyCode": "Party",
      "Count": "Count",
      "District" : "District"
    };

    vm.operators = [{ //Symbols for the user, correct operation keys for the mongoDB query
      name : "=",
      op   : "$eq"
    }, {
      name : ">",
      op   : "$gt"
    }, {
      name : "<",
      op   : "$lt"
    }, {
      name : ">=",
      op   : "$gte"
    }, {
      name : "<=",
      op   : "$lte"
    }, {
      name : "contains",
      op   : "$regex"
    }, {
      name : "not equals",  //When you realize != is probably too complicated for our end users.
      op   : "$ne"
    }]; 

    //End translation objects

    //Get meta data on init
    dataService.getMeta() 
    .success( function (data) {
      vm.meta = data;
      console.log(vm.meta);
    })
    .error ( function (err ){
      vm.error = err;
    });

    vm.header = { //For page-header directive's content attribute.
      title: "Political Statistics Engine v0.2",
      strapline: "Lousiana Voters"
    };

    vm.next = function () {
      angular.element(".infScroll").scrollTop(0);
      vm.err = "";
      vm.page += 1;
      var start = vm.page*100 - 99;
      var end = vm.page*100;
      var data = vm.data;
      vm.displayData = data.slice(start - 1, end);

      if (vm.count < vm.page*100) {
        vm.ngRepEnd = vm.count;
      }

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
        var end = vm.page*100 - 1;
        var data = vm.data;
        vm.displayData = data.slice(start, end);

        //Display purposes
        vm.ngRepStart = start;
        vm.ngRepEnd = end;
      }
    };

    vm.removeMe = function (i) {
      vm.qArray.splice(i, 1);
      vm.queries -= 1;
    };

    vm.initiation = function (vr) {
      vm.qArray[vr] = new Object();
      vm.queries += vm.queries;
    };

    vm.giveMeData = function () {
      //Reinitialize data object
      vm.data = null;

      //Use data service here, route '/jsonData', query: MongoDB default.
      vm.error = ""; //Lets prepare for catching errors. 
      vm.loading = true;  

      vm.page = 1; //Reinitialize pagination on data refresh
      vm.pages = 0;

      vm.query = new Object();

      var num = 1; //Local to add a running count column

      console.log(vm.qArray); //Query builder array 
      angular.forEach(vm.qArray, function (v, k) { //V is query object
        if (v.op && v.param && v.value) {
          if (!vm.query[v.param]) {
            vm.query[v.param] = new Object();  
          }
          vm.query[v.param][v.op] = v.value;
        }
      });

      console.log(vm.query);

      vm.loading = true;
      dataService.jsonData(vm.query, vm.limit) //API call, my API is really simple, go check it out @ root/app_api/controllers/main.js
      .success (function (data) {
        vm.loading = false;
        vm.data = data.data; //LOL, b/c we can't do array.totalCount, have to move it one layer up so parent can be object, not array

        vm.count = vm.data.length;
        vm.total = data.total;
        console.log(data); //Data AND total

        if (vm.count < 100) {
          vm.ngRepEnd = vm.count;
        } else {
          vm.ngRepEnd = 100;
        }

        vm.pages = Math.ceil( vm.count / 100 );

        vm.displayData = vm.data.slice(0, vm.ngRepEnd);
        if (vm.data[0]) {
          vm.keys = Object.keys(vm.data[0]);
        } else {
          vm.error = "Your search returned 0 results.";
        }

        angular.forEach(vm.data, function (v, k) {
          vm.data[k]["Count"] = "#" + num;
          num += 1;
        });
      })
      .error (function (err) {
        vm.loading = false;
        $log.debug(err);
        vm.error = err;
      });
    };

    vm.addQuery = function () {
      vm.qArray[vm.queries] = new Object();
      vm.queries += 1;
    };

    vm.giveMeMeta = function () {
      console.log("Time to get META..");
      dataService.getMeta()
      .success( function (data) {
        console.log(data);

        //Generate district
        function council (ward, prec, array) {
          ward = ward.trim();
          prec = prec.trim();
          prec = ward + '-' + prec;
          var dist;
          
          angular.forEach(array, function (va,ke) {
            
            if (va.precinct == prec) {
              dist = va.district;
            }
          })
          return dist;
        }
      })
      .error( function (err) {
        console.log(err);
      })
    };
      
  }
})()