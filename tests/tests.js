/* global shiny */

(function () {
    
    var s = shiny;
    
    function assert (value, message) {
        if (!value) {
            throw new Error(message);
        }
    }
    
    function testValues () {
        
        var obj = {baz: "bar"};
        var original = [1, 2, 3, "foo", obj];
        var result = s.values(original);
        
        assert(Array.isArray(result), "Return value of values() must be an array!");
        
        original.forEach(function (item, index) {
            assert(item === result[index], "Values must be the same.");
        });
        
        console.log("Function shiny.values() works!");
    }
    
    function testKeys () {
        
        var obj = {baz: "bar"};
        var original = [1, 2, 3, "foo", obj];
        var result = s.keys(original);
        
        assert(Array.isArray(result), "Return value of keys() must be an array!");
        
        s.each(original, function (item, index) {
            assert(item === original[result[index]], "Values must be the same.");
        });
        
        console.log("Function shiny.keys() works!");
    }
    
    function testFilter () {
        
        var original = [1, 2, 3, 4, 5];
        var expected = [1, 2, 3, undefined, undefined];
        var result = s.filter(original, function (item) {
            return item < 4;
        });
        
        assert(result.length === 3, "Result is expected to contain 3 items.");
        
        s.each(expected, function (item, index) {
            assert(item === result[index], "Result is different than expected.");
        });
        
        console.log("Function shiny.filter() works!");
    }
    
    function testPipe () {
        
    }
    
    testValues();
    testKeys();
    testFilter();
    
    var printType = s.method();
    
    s.dispatch(printType, function (n) { return typeof n; }, function (n) { return typeof n; });
    
    /*
    s.specialize(
        printType,
        function (n) { return n === "number" || n === "string"; },
        function (n) { return n === "number" || n === "string"; },
        console.log.bind(console, ">> (string/number), (string/number)!")
    );
    */
    
    s.specialize(printType, "number", "number", console.log.bind(console, ">> number, number"));
    s.specialize(printType, "string", "string", console.log.bind(console, ">> string, string"));
    s.specialize(printType, "object", "object", console.log.bind(console, ">> object, object"));
    
    printType([], {foo: 3});
    printType(5, 7);
    printType("foo", "bar", 123);
    
    var print = s.method(function () { console.log("No implementation found."); });
    
    s.specialize(print, {foo: "bar"},
        console.log.bind(console, "Dispatch on deeply matched object: check!"));
    
    print({});
    print({foo: "bar"});
    
    console.log(s.equal({}, {foo: "foo"}));
    
}());
