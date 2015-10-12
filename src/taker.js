/* global using */

using("shiny.partial", "shiny.take").
define("shiny.taker", function (partial, take) {
    
    function taker (key) {
        return partial(take, undefined, key);
    }
    
    return taker;
    
});
