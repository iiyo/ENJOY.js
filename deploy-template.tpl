/* global using, define, window, module */

(function () {
    
    var out = {};
    
    {{content}}
    
    (function () {
        
        var scripts;
        
        if (typeof using === "function") {
            
            scripts = document.getElementsByTagName("script");
            using.modules.shiny = scripts[scripts.length - 1].src;
            
            using().define("shiny", function () {
                return out;
            });
        }
        else if (typeof module === "object" && module !== null) {
            module.exports = out;
        }
        else if (typeof define === "function") {
            define(function () {
                return out;
            });
        }
        else if (typeof window === "object" && window !== null) {
            window.shiny = out;
        }
        
    }());
}());

