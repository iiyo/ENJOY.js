/* global using */

using("shiny.pipe", "shiny.apply").define("shiny.piped", function (pipe, apply) {
    
    function piped () {
        
        var functions = [].slice.call(arguments);
        
        return function (value) {
            
            var args = functions.slice();
            
            args.unshift(value);
            
            return apply(pipe, args);
        };
    };
    
    return piped;
});
