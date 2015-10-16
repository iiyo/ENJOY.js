/* global enjoy */

(function () {
    
    var e = enjoy;
    
    function assert (value, message) {
        if (!value) {
            throw new Error(message);
        }
    }
    
    function testValues () {
        
        var obj = {baz: "bar"};
        var original = [1, 2, 3, "foo", obj];
        var result = e.values(original);
        
        assert(Array.isArray(result), "Return value of values() must be an array!");
        
        original.forEach(function (item, index) {
            assert(item === result[index], "Values must be the same.");
        });
        
        console.log("Function enjoy.values() works!");
    }
    
    function testKeys () {
        
        var obj = {baz: "bar"};
        var original = [1, 2, 3, "foo", obj];
        var result = e.keys(original);
        
        assert(Array.isArray(result), "Return value of keys() must be an array!");
        
        e.each(original, function (item, index) {
            assert(item === original[result[index]], "Values must be the same.");
        });
        
        console.log("Function enjoy.keys() works!");
    }
    
    function testFilter () {
        
        var original = [1, 2, 3, 4, 5];
        var expected = [1, 2, 3, undefined, undefined];
        var result = e.filter(original, function (item) {
            return item < 4;
        });
        
        assert(result.length === 3, "Result is expected to contain 3 items.");
        
        e.each(expected, function (item, index) {
            assert(item === result[index], "Result is different than expected.");
        });
        
        console.log("Function enjoy.filter() works!");
    }
    
    function testPipe () {
        
    }
    
    testValues();
    testKeys();
    testFilter();
    
    var printType = e.method();
    
    //s.dispatch(printType, function (n) { return typeof n; }, function (n) { return typeof n; });
    
    
    e.specialize(
        printType,
        function (n) { return e.is_number(n) || e.is_string(n); },
        function (n) { return e.is_number(n) || e.is_string(n); },
        console.log.bind(console, ">> (string/number), (string/number)")
    );
    
    
    e.specialize(printType, e.t_number, e.t_number, console.log.bind(console, ">> number, number"));
    e.specialize(printType, e.t_string, e.t_string, console.log.bind(console, ">> string, string"));
    e.specialize(printType, e.t_object, e.t_object, console.log.bind(console, ">> object, object"));
    
    printType([], {foo: 3});
    printType(5, 7);
    printType("foo", "bar", 123);
    
    var print = e.method(function () { console.log("No implementation found."); });
    
    e.specialize(print, {foo: "bar"},
        console.log.bind(console, "Dispatch on deeply matched object: check!"));
    
    print({});
    print({foo: "bar"});
    
    console.log(e.equal({}, {foo: "foo"}));
    
    var vehicle = e.type({wheels: e.t_integer});
    var car = e.type({seats: e.t_integer});
    
    e.derive(car, vehicle);
    
    console.log("Is {wheels: 4} a vehicle?", e.is_a({wheels: 4}, vehicle));
    console.log("Is {wheels: 4} a car?", e.is_a({wheels: 4}, car));
    
    console.log("Is {wheels: 4, seats: 5} a vehicle?", e.is_a({wheels: 4, seats: 5}, vehicle));
    console.log("Is {wheels: 4, seats: 5} a car?", e.is_a({wheels: 4, seats: 5}, car));
    
    console.log("Is {seats: 5} a vehicle?", e.is_a({seats: 5}, vehicle));
    console.log("Is {seats: 5} a car?", e.is_a({seats: 5}, car));
    
    console.log("---------- EMPTY TYPES");
    
    var father = e.type();
    var mother = e.type();
    var child = e.type();
    var grandchild = e.type();
    
    e.derive(child, father);
    e.derive(child, mother);
    e.derive(grandchild, child);
    
    console.log("Child, father:", e.is_a(child, father));
    console.log("Child, mother:", e.is_a(child, mother));
    console.log("Grandchild, child:", e.is_a(grandchild, child));
    console.log("Father, child:", e.is_a(father, child));
    console.log("Mother, child:", e.is_a(mother, child));
    
    var my_method = e.method(function () {
        console.log("Default implementation.");
    });
    
    e.specialize(my_method, e.t_integer, e.t_integer, function (n1, n2) {
        console.log("integer, integer:", n1, n2);
    });
    
    e.specialize(my_method, 0.5, e.t_integer, function (n1, n2) {
        console.log("0.5, integer:", n1, n2);
    });
    
    e.specialize(my_method, e.t_object, e.t_integer, function (o1, n1) {
        console.log("object, integer:", o1, n1);
    });
    
    my_method(5, 3);
    my_method({}, 12);
    my_method({}, 1.2);
    my_method(0.6, 2);
    my_method(0.5, 2);
    
}());
