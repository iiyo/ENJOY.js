/* global using */

using(
    "shiny.apply",
    "shiny.bind",
    "shiny.call",
    "shiny.each",
    "shiny.filter",
    "shiny.has",
    "shiny.keys",
    "shiny.map",
    "shiny.pipe",
    "shiny.piped",
    "shiny.reduce",
    "shiny.some",
    "shiny.values"
).run(function (
    apply,
    bind,
    call,
    each,
    filter,
    has,
    keys,
    map,
    pipe,
    piped,
    reduce,
    some,
    values
) {
    
    function assert (value, message) {
        if (!value) {
            throw new Error(message);
        }
    }
    
    function testValues () {
        
        var obj = {baz: "bar"};
        var original = [1, 2, 3, "foo", obj];
        var result = values(original);
        
        assert(Array.isArray(result), "Return value of values() must be an array!");
        
        original.forEach(function (item, index) {
            assert(item === result[index], "Values must be the same.");
        });
        
        console.log("Function shiny.values() works!");
    }
    
    function testKeys () {
        
        var obj = {baz: "bar"};
        var original = [1, 2, 3, "foo", obj];
        var result = keys(original);
        
        assert(Array.isArray(result), "Return value of keys() must be an array!");
        
        each(original, function (item, index) {
            assert(item === original[result[index]], "Values must be the same.");
        });
        
        console.log("Function shiny.keys() works!");
    }
    
    function testFilter () {
        
        var original = [1, 2, 3, 4, 5];
        var expected = [1, 2, 3, undefined, undefined];
        var result = filter(original, function (item) {
            return item < 4;
        });
        
        assert(result.length === 3, "Result is expected to contain 3 items.");
        
        each(expected, function (item, index) {
            assert(item === result[index], "Result is different than expected.");
        });
        
        console.log("Function shiny.filter() works!");
    }
    
    function testPipe () {
        
    }
    
    testValues();
    testKeys();
    testFilter();
    
});
