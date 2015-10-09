/* global using */

using("shiny.each").define("shiny.filter", function (each) {
    
    function filter (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            if (fn(item, key, collection)) {
                items.push(item);
            }
        });
        
        return items;
    }
    
    return filter;
    
});
