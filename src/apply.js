/* global using */

using().define("shiny.apply", function () {
    
    function apply (fn, args) {
        return fn.apply(undefined, args);
    }
    
    return apply;
    
});
