/* global using */

using("shiny.each").define("shiny.reduce", function (each) {
    
    function reduce (collection, fn, value) {
        
        each(collection, function (item, key) {
            value = fn(value, item, key, collection);
        });
        
        return value;
    }
    
    return reduce;
    
});
