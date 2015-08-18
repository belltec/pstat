(function(){
  angular
    .module('reviewModule')
    .directive('scrolling', scrolling);

     scrolling.$inject = ['$window', '$location'];
    function scrolling ($window, $location) {
    return function (scope, element, attr) {

    var path = $location.path();
      path = path.split("/");
      page='overview';
    
    if (path.indexOf(page) !== -1){
      
      angular.element($window).bind("scroll", function () {
        if (this.pageYOffset >=3) {
            scope.boolClass = true;
            scope.boolClassChange = false;
          //  console.log('scrolled');
        } else {
            scope.boolClass = false;
          //  console.log('header back');
        }
        scope.$apply();
        })
      } else {return;}

      }
    }
})()