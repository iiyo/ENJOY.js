/* global using, define, window, module */

(function () {
    
    var out = {
        hidden_properties: [],
        poly: {}, /* methods for basic functions */
        core: {} /* basic functions */
    };
    
    {{content}}
    
    (function () {
        
        var scripts;
        
        if (typeof using === "function") {
            
            scripts = document.getElementsByTagName("script");
            using.modules.enjoy = scripts[scripts.length - 1].src;
            
            using().define("enjoy", function () {
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
            window.enjoy = out;
        }
        
    }());
}());

