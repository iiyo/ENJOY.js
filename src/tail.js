/* global using */

using().define("shiny.tail", function () {
    
    function tail (iterable) {
        return iterable.slice(1);
    }
    
    return tail;
    
});
