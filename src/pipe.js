/* global using */

using("shiny.each").define("shiny.pipe", function (each) {
    
    function pipe (value) {
        
        each(arguments, function (fn, index) {
            if (index > 0) {
                value = fn(value);
            }
        });
        
        return value;
    }
    
    return pipe;
    
});
