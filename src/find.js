/* global using */

using("shiny.some").define("shiny.find", function (some) {
    
    function find (collection, fn) {
        
        var value;
        
        some(collection, function (item, key) {
            
            if (fn(item, key, collection)) {
                value = item;
                return true;
            }
            
            return false;
        });
        
        return value;
    }
    
});
