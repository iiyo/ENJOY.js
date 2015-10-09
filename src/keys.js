/* global using */

using("shiny.map").define("shiny.keys", function (map) {
    
    function keys (collection) {
        return map(collection, function (item, key) {
            return key;
        });
    }
    
    return keys;
    
});
