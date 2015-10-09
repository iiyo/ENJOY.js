/* global using */

using("shiny.apply").define("shiny.bind", function (apply) {
    
    function bind (fn) {
        
        var args = [].slice.call(arguments);
        
        args[0] = undefined;
        args.unshift(undefined);
        
        return apply(fn.bind, args);
    }
    
    return bind;
    
});
