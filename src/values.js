/* global using */

using("shiny.map").define("shiny.values", function (map) {
    
    function values (collection) {
        return map(collection, function (item) {
            return item;
        });
    }
    
    return values;
    
});
