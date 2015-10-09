/* global using */

using("shiny.each").define("shiny.map", function (each) {
    
    function map (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            items.push(fn(item, key, collection));
        });
        
        return items;
    }
    
    return map;
});
