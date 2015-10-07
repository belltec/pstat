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
      "Count": "Count"
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
      console.log(angular.element(".infScroll").scrollTop(0));
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

vm.districts = {w03p14: 'A',
          w03p18: 'A',
          w03p19: 'A',
          w03p20: 'A',

          w04p07: 'A',
          w04p08: 'A',
          w04p09: 'A',
          w04p11: 'A',
          w04p14: 'A',
          w04p15: 'A',
          w04p17: 'A',
          w04p17A: 'A',
          w04p18: 'A',
          w04p20: 'A',
          w04p21: 'A',

          w05p08: 'A',
          w05p09: 'A',
          w05p10: 'A',
          w05p11: 'A',
          w05p12: 'A',
          w05p13: 'A',
          w05p15: 'A',
          w05p16: 'A',

          w06p08: 'A',
          w06p09: 'A',

          w07p12: 'A',
          w07p17: 'A',
          w07p18: 'A',

          w14p01: 'A',
          w14p02: 'A',
          w14p03: 'A',
          w14p04: 'A',
          w14p05: 'A',
          w14p06: 'A',
          w14p07: 'A',
          w14p08: 'A',
          w14p09: 'A',
          w14p10: 'A',
          w14p11: 'A',
          w14p12: 'A',
          w14p13A: 'A',
          w14p14: 'A',
          w14p15: 'A',
          w14p16: 'A',
          w14p17: 'A',
          w14p18A: 'A',
          w14p19: 'A',
          w14p20: 'A',
          w14p21: 'A',

          w16p01: 'A',
          w16p01A: 'A',
          w16p02: 'A',
          w16p03: 'A',
          w16p04: 'A',
          w16p05: 'A',
          w16p06: 'A',
          w16p07: 'A',
          w16p08: 'A',

          w17p01: 'A',
          w17p02: 'A',
          w17p03: 'A',
          w17p04: 'A',
          w17p05: 'A',
          w17p06: 'A',
          w17p07: 'A',
          w17p08: 'A',
          w17p09: 'A',
          w17p10: 'A',
          w17p11: 'A',
          w17p12: 'A',
          w17p13: 'A',
          w17p13A: 'A',
          w17p14: 'A',
          w17p15: 'A',
          w17p16: 'A',
          w17p17: 'A',
          w17p18: 'A',
          w17p18A: 'A',
          w17p19: 'A',
          w17p20: 'A',

          w01p01: 'B',
          w01p02: 'B',
          w01p05: 'B',
          w01p06: 'B',

          w02p01: 'B',
          w02p02: 'B',
          w02p03: 'B',
          w02p04: 'B',
          w02p06: 'B',
          w02p06A: 'B',
          w02p07: 'B',

          w03p01: 'B',
          w03p03: 'B',
          w03p05: 'B',
          w03p08: 'B',
          w03p09: 'B',
          w03p12: 'B',
          w03p15: 'B',

          w04p03: 'B',
          w04p04: 'B',
          w04p05: 'B',
          w04p06: 'B',

          w10p03: 'B',
          w10p06: 'B',
          w10p07: 'B',
          w10p08: 'B',
          w10p09: 'B',
          w10p11: 'B',
          w10p12: 'B',
          w10p13: 'B',
          w10p14: 'B',

          w11p02: 'B',
          w11p03: 'B',
          w11p04: 'B',
          w11p05: 'B',
          w11p08: 'B',
          w11p09: 'B',
          w11p10: 'B',
          w11p11: 'B',
          w11p12: 'B',
          w11p13: 'B',
          w11p14: 'B',
          w11p17: 'B',

          w12p01: 'B',
          w12p02: 'B',
          w12p03: 'B',
          w12p03: 'B',
          w12p04: 'B',
          w12p05: 'B',
          w12p06: 'B',
          w12p07: 'B',
          w12p08: 'B',
          w12p09: 'B',
          w12p10: 'B',
          w12p11: 'B',
          w12p12: 'B',
          w12p13: 'B',
          w12p14: 'B',
          w12p16: 'B',
          w12p17: 'B',
          w12p19: 'B',

          w13p01: 'B',
          w13p02: 'B',
          w13p03: 'B',
          w13p04: 'B',
          w13p05: 'B',
          w13p06: 'B',
          w13p07: 'B',
          w13p08: 'B',
          w13p09: 'B',
          w13p10: 'B',
          w13p11: 'B',
          w13p12: 'B',
          w13p13: 'B',
          w13p14: 'B',
          w13p15: 'B',
          w13p16: 'B',

          w14p23: 'B',
          w14p24A: 'B',
          w14p25: 'B',
          w14p26: 'B',

          w16p09: 'B',

          w04p02: 'C',

          w05p01: 'C',
          w05p02: 'C',
          w05p03: 'C',
          w05p04: 'C',

          w06p01: 'C',
          w06p02: 'C',
          w06p04: 'C',

          w07p01: 'C',
          w07p02: 'C',
          w07p04: 'C',
          w07p05: 'C',
          w07p06: 'C',

          w08p01: 'C',
          w08p02: 'C',
          w08p04: 'C',
          w08p06: 'C',

           w09p09: 'C',
           w09p11: 'C',
           w09p12: 'C',
           w09p13: 'C',
           w09p14: 'C',
           w09p15: 'C',
           w09p16: 'C',
           w09p19: 'C',

           w04p22: 'D',
           w04p23: 'D',

           w05p05: 'D',
           w05p07: 'D',
           w05p08: 'D',
           w05p17: 'D',
           w05p18: 'D',

           w06p06: 'D',
           w06p07: 'D',

           w07p05: 'D',
           w07p06: 'D',
           w07p07: 'D',
          w07p08: 'D',
          w07p09A: 'D',
          w07p10: 'D',
          w07p11: 'D',
          w07p12: 'D',
          w07p13: 'D',
          w07p14: 'D',
          w07p15: 'D',
          w07p16: 'D',
          w07p19: 'D',
          w07p20: 'D',
          w07p21: 'D',
          w07p23: 'D',
          w07p24: 'D',
          w07p25: 'D',
          w07p25A: 'D',
          w07p26: 'D',
          w07p27: 'D',
          w07p27B: 'D',
          w07p28: 'D',
          w07p28A: 'D',
          w07p29: 'D',
          w07p30: 'D',
          w07p32: 'D',
          w07p33: 'D',
          w07p34: 'D',
          w07p35: 'D',
          w07p37: 'D',
          w07p37A: 'D',
          w07p40: 'D',
          w07p41: 'D',
          w07p42: 'D',

          w08p07: 'D',
          w08p08: 'D',
          w08p09: 'D',
          w08p12: 'D',
          w08p13: 'D',
          w08p14: 'D',
          w08p15: 'D',
          w08p19: 'D',
          w08p20: 'D',
          w08p21: 'D',
          w08p22: 'D',
          w08p23: 'D',
          w08p24: 'D',
          w08p25: 'D',
          w08p26: 'D',
          w08p27: 'D',
          w08p28: 'D',
          w08p30: 'D',

          w09p10: 'D',
          w09p17: 'D',
          w09p21: 'D',
          w09p23: 'D',
          w09p25: 'D',
          w09p26: 'D',
          w09p28: 'D',
          w09p28C: 'D',
          w09p28E: 'D',
          w09p29: 'D',
          w09p30: 'D',
          w09p30A: 'D',
          w09p31: 'D',
          w09p31A: 'D',
          w09p31B: 'D',
          w09p31D: 'D',
          w09p33: 'D',
          w09p42: 'D',

          w09p01: 'E',
          w09p03: 'E',
          w09p3A: 'E',
          w09p04: 'E',
          w09p05: 'E',
          w09p05A: 'E',
          w09p06B: 'E',
          w09p06C: 'E',
          w09p06D: 'E',
          w09p06E: 'E',
          w09p06F: 'E',
          w09p07: 'E',
          w09p08: 'E',
          w09p08A: 'E',
          w09p32: 'E',
          w09p34A: 'E',
          w09p35: 'E',
          w09p35A: 'E',
          w09p36: 'E',
          w09p36B: 'E',
          w09p37: 'E',
          w09p38: 'E',
          w09p38A: 'E',
          w09p39: 'E',
          w09p39B: 'E',
          w09p40: 'E',
          w09p40A: 'E',
          w09p40C: 'E',
          w09p41: 'E',
          w09p41A: 'E',
          w09p41B: 'E',
          w09p41C: 'E',
          w09p41D: 'E',
          w09p42C: 'E',
          w09p43A: 'E',
          w09p43B: 'E',
          w09p43C: 'E',
          w09p43E: 'E',
          w09p43F: 'E',
          w09p43G: 'E',
          w09p43H: 'E',
          w09p43I: 'E',
          w09p43J: 'E',
          w09p43K: 'E',
          w09p43L: 'E',
          w09p43M: 'E',
          w09p43N: 'E',
          w09p44: 'E',
          w09p44A: 'E',
          w09p44B: 'E',
          w09p44D: 'E',
          w09p44E: 'E',
          w09p44F: 'E',
          w09p44G: 'E',
          w09p44I: 'E',
          w09p44J: 'E',
          w09p44L: 'E',
          w09p44M: 'E',
          w09p44N: 'E',
          w09p44O: 'E',
          w09p44P: 'E',
          w09p44Q: 'E',
          w09p45: 'E',
          w09p45A: 'E'
        };


      vm.council = function (voter) {
       // $log.debug(voter.Jurisdiction_Ward);
       // $log.debug(voter.Jurisdiction_Precinct);
        var pt = 'w' + voter.Jurisdiction_Ward.trim() + 'p' + voter.Jurisdiction_Precinct.trim(); 
       // $log.debug(pt);
       // $log.debug(vm.districts[pt]);
        return vm.districts[pt];
      };
  }
})()