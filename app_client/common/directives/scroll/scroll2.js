(function(){
  angular
    .module('reviewModule')
    .directive('scrolling2', scrolling2);

    scrolling2.$inject = ['$window', '$location'];
    function scrolling2 ($window, $location) {
    return function (scope, element, attr) {
      var path = $location.path();
      path = path.split("/");
      page='overview';
    
    if (path.indexOf(page) !== -1) {
      angular.element($window).bind("scroll", function () {
        if (this.pageYOffset >=3) {
            document.getElementById("title-top").className = "";
            scope.boolClass2 = false;
        //    console.log('title should be there');
        } else {
            document.getElementById("title-top").className = "hideMe";
            scope.boolClass2 = true;
         //   console.log('title gone');
        }
        scope.$apply();
        })
      } else {return;}

      }
    }
})()