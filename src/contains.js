/* global using */

using("shiny.some").define("shiny.contains", function (some) {
    
    function contains (collection, item) {
        return some(collection, function (currentItem) {
            return item === currentItem;
        }) || false;
    }
    
    return contains;
    
});
