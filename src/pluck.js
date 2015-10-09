/* global using */

using("shiny.each").define("shiny.pluck", function (map) {
    
    function pluck (collection, key) {
        
        var result = [];
        
        map(collection, function (item) {
            if (key in item) {
                result.push(item[key]);
            }
        });
        
        return result;
    }
    
    return pluck;
    
});
