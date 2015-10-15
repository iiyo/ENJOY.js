# ENJOY.js

ENJOY is a JavaScript library meant to make programming JavaScript in a functional style more pleasant. To do that, it features the following:

- Object-less versions of Array's prototype methods like .map()
- An each() function that works with all types of collections
- Functional polymorphism with multimethods
- An optional hierarchical type system that can be used with multimethods and by itself
- Defining simple schemas and validating data according to these schemas (minus the suckiness of XML Schema and the like)
- Higher-order functions that help you with composition

## Usage examples

### Iteration

Function `each(collection, fn)` iterates a collection like an array or object.

```javascript
using("enjoy::each").run(function (each) {
    
    each([1, 2, 3], function (item, index, collection) {
        // ...
    });
    
    each({foo: "bar", bar: "baz"}, function (item, key, collection) {
        // ...
    });
});
```

Function `some(collection, fn)` iterates a collection. It returns `true` if some the
callback function `fn` returns `true` for one of the items in the collection and breaks
the iteration in this case. If the callback returns `false` for all the items, `some`
returns `false`.

```javascript
using("enjoy::some").run(function (some) {
    
    some([1, 2, 3], function (item, index, collection) {
        
        if (/* we have what we wanted */) {
            return true; // shortcuts iteration
        }
        
        return true;
    });
    
});
```

### Hierarchical types

```javascript
using("enjoy::type", "enjoy::derive", "enjoy::is_a").
run(function (type, derive, is_a) {
    
    function is_number (n) {
        return typeof n === "number";
    }
    
    function is_integer (n) {
        return is_number(n) && n % 1 === 0;
    }
    
    var t_number = type(is_number);
    var t_integer = type(is_integer);
    
    derive(t_integer, t_number); // make t_integer subtype of t_number
    
    console.log(is_a(t_integer, t_number)); // true: it's derived
    console.log(is_a(0.5, t_number)); // true: matches t_number's predicate
    console.log(is_a(1, t_number)); // true: matches t_number's predicate
    console.log(is_a(1, t_integer)); // true: matches t_integer's predicate
    console.log(is_a(0.5, t_integer)); // false: doesn't match t_integer's predicate
    
    // So far this didn't really use the hierarchical aspect much.
    // Let's make the relationship established by derive show:
    
    var vehicle = type(); // No predicate: vehicle is an "abstract" base type
    var car = type({wheels: t_integer}); // Matching a schema
    
    console.log(is_a(car, vehicle)); // false: not related yet
    console.log(is_a({wheels: 4}, vehicle)); // false: not related yet
    console.log(is_a({wheels: 4}, car)); // true: matched by schema
    
    derive(car, vehicle); // now car's a vehicle
    
    console.log(is_a({wheels: 4}, vehicle)); // true: it's a car, so it's a vehicle
    console.log(is_a(car, vehicle)); // true: type car's a subtype of vehicle
});
```

### Schema validators

### Polymorphism with multimethods

Classes in JavaScript are quite awkward. Fortunately there's another way for polymorphism: Multimethods. They allow dispatching on more than one argument. You can think of them as
"switch statement on steroids"... only better, because they can be extended at runtime.

Multimethods are methods that don't belong to classes; therefore there's no need to trap
your data inside of classes.

```javascript
using("enjoy::method", "enjoy::specialize", "enjoy::t_integer", "enjoy::t_object").
define("my_method", function (method, specialize, t_integer) {
    
    var my_method = method(function () {
        console.log("Default implementation.");
    });
    
    specialize(my_method, t_integer, t_integer, function (n1, n2) {
        console.log("integer, integer:", n1, n2);
    });
    
    specialize(my_method, 0.5, t_integer, function (n1, n2) {
        console.log("0.5, integer:", n1, n2);
    });
    
    return my_method;
    
});
```
