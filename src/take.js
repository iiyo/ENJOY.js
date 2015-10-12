/* global using */

using().define("shiny.take", function () {
    
    function take (obj, key) {
        return obj[key];
    }
    
    return take;
    
});
