
(function(){
angular
  .module('pstat')
  .directive('infScroll', infScroll);

    function infScroll () {  
      return function (scope, element, attribute) {
        
        var elm = element[0];
        
        element.bind('scroll', function() {
            
            if (elm.scrollTop + elm.offsetHeight >= elm.scrollHeight) {
                
                scope.$apply(attribute.infScroll);
            }
        });
    };
}
})()