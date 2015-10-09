/* global using */

using("shiny.some").define("shiny.every", function (some) {
    
    function every (collection, fn) {
        
        var result = true;
        
        some(collection, function (item, key) {
            
            if (!fn(item, key, collection)) {
                result = false;
                return true;
            }
            
            return false;
        });
        
        return result;
    }
    
    return every;
    
});
