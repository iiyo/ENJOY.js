/* global using */

using().define("shiny.call", function () {
    
    function call (fn) {
        
        var args = [].slice.call(arguments);
        
        args.shift();
        
        return fn.apply(undefined, args);
    }
    
    return call;
    
});
