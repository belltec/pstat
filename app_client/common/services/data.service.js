(function () {
  angular.module('pstat')
         .service('dataService', dataService);

  dataService.$inject = ['$log', '$http'];
  function dataService ($log, $http) {
    var jsonData = function (data, limit) {
      var dataz = JSON.stringify(data);
      return $http.get('/api/jsonData', {params: {
        data: dataz,
        limit: limit
      }});
    };

    var getMeta = function (req) {
      return $http.get('/api/getMeta');
    };

    return {
      jsonData    : jsonData,
      getMeta     : getMeta
    }
  };
})()
