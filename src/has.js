/* global using */

using("shiny.some").define("shiny.has", function (some) {
    
    function has (collection, key) {
        return some(collection, function (item, currentKey) {
            return key === currentKey;
        });
    }
    
    return has;
    
});
