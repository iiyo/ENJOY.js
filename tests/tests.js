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
    }
    
    testValues();
    
});
