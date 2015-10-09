/* global using */

using().define("shiny.apply", function () {
    
    function apply (fn, args) {
        return fn.apply(args);
    }
    
    return apply;
    
});
