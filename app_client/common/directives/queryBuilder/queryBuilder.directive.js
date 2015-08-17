(function () {

  angular.module("pstat")
         .directive("queryBuilder", queryBuilder);

  function queryBuilder() {
    return {
      templateUrl: "queryBuilder.template.html"
    }
  };

})();