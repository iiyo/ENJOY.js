/* global using */

using().define("shiny.some", function () {
    
    function some (collection, fn) {
        return Array.isArray(collection) ? someArray(collection, fn) : someObject(collection, fn);
    }
    
    return some;
    
    function someArray (collection, fn) {
        
        var index, length, value;
        
        for (index = 0, length = collection.length; index < length; index += 1) {
            
            value = fn(collection[index], index, collection);
            
            if (value) {
                return value;
            }
        }
        
        return false;
    }
    
    function someObject (collection, fn) {
        
        var key, value;
        
        for (key in collection) {
            
            value = fn(collection[key], key, collection);
            
            if (value) {
                return value;
            }
        }
        
        return false;
    }
    
});
