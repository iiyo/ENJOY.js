//
// Turns an object into an array by putting its keys into the objects
// contained within the array.
//
// Example:
//
//     {foo: {}, bar: {}} => [{name: "foo"},{name: "bar"}]
//

/* global using */

using("shiny.each").define("shiny.privatize", function (each) {
    
    function privatize (collection, key) {
        
        var result = [];
        
        each(collection, function (item, currentKey) {
            
            item[key] = currentKey;
            
            result.push(item);
        });
        
        return result;
    }
    
    return privatize;
    
});
