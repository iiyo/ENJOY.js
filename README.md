# ENJOY.js

ENJOY is a JavaScript library meant to make programming JavaScript in a functional style more pleasant. To do that, it features the following:

- Object-less versions of Array's prototype methods like .map()
- An each() function that works with all types of collections
- Functional polymorphism with multimethods
- An optional hierarchical type system that can be used with multimethods and by itself
- Defining simple schemas and validating data according to these schemas (minus the suckiness of XML Schema and the like)
- Higher-order functions that help you with composition

## Installation

Install using NPM:

    npm install enjoy-js

On the frontend, you can use ENJOY with either [using.js](https://github.com/iiyo/using.js):

```html
<script src="path/to/enjoy/bin/enjoy.min.js"></script>
```

```javascript
using("enjoy").run(function (enjoy) { /* ... */ });
```

Or without it:

```html
<script src="path/to/enjoy/bin/enjoy-core.min.js"></script>
```

```javascript
enjoy.isNumber(1.12);
```

## Usage examples

### Polymorphism with multimethods

Classes in JavaScript are quite awkward. Fortunately there's another way for polymorphism: Multimethods. They allow dispatching on more than one argument. You can think of them as
"switch statement on steroids"... only better, because they can be extended at runtime.

Multimethods are methods that don't belong to classes; therefore there's no need to trap
your data inside of classes.

```javascript
using("enjoy::method", "enjoy::specialize", "enjoy::t_integer", "enjoy::t_object").
define("myMethod", function (method, specialize, t_integer, t_object) {
    
    var myMethod = method(function () {
        console.log("Default implementation.");
    });
    
    specialize(myMethod, t_integer, t_integer, function (n1, n2) {
        console.log("integer, integer:", n1, n2);
    });
    
    specialize(myMethod, 0.5, t_integer, function (n1, n2) {
        console.log("0.5, integer:", n1, n2);
    });
    
    specialize(myMethod, t_object, t_integer, function (o1, n1) {
        console.log("object, integer:", o1, n1);
    });
    
    return myMethod;
    
});
```

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
using("enjoy::type", "enjoy::derive", "enjoy::isA").
run(function (type, derive, isA) {
    
    // Note: isNumber, isInteger, t_number and t_integer
    // are part of the library; they are defined here again
    // just for showing how custom types can be created.
    
    function isNumber (n) {
        return typeof n === "number";
    }
    
    function isInteger (n) {
        return isNumber(n) && n % 1 === 0;
    }
    
    var t_number = type(isNumber);
    var t_integer = type(isInteger);
    
    derive(t_integer, t_number); // make t_integer subtype of t_number
    
    console.log(isA(t_integer, t_number)); // true: it's derived
    console.log(isA(0.5, t_number)); // true: matches t_number's predicate
    console.log(isA(1, t_number)); // true: matches t_number's predicate
    console.log(isA(1, t_integer)); // true: matches t_integer's predicate
    console.log(isA(0.5, t_integer)); // false: doesn't match t_integer's predicate
    
    // So far this didn't really use the hierarchical aspect much.
    // Let's make the relationship established by derive show:
    
    var vehicle = type(); // No predicate: vehicle is an "abstract" base type
    var car = type({wheels: t_integer}); // Matching a schema
    
    console.log(isA(car, vehicle)); // false: not related yet
    console.log(isA({wheels: 4}, vehicle)); // false: not related yet
    console.log(isA({wheels: 4}, car)); // true: matched by schema
    
    derive(car, vehicle); // now car's a vehicle
    
    console.log(isA({wheels: 4}, vehicle)); // true: it's a car, so it's a vehicle
    console.log(isA(car, vehicle)); // true: type car's a subtype of vehicle
});
```

### Schema validators

In ENJOY.js, validating data can be done by using either the `valid(data, schema)` function
or by creating a validator with the `validator(schema)` function and then using the resulting
function to check the data.

ENJOY's `isA(a, t)` function and the `type(checker)` function are both able to be used with schemas.

Schemas can contain pure data, as well as predicate functions and types, which are used to validate
specific values in the data. This means the data may not include functions - but they shouldn't anyway.

Here's an example:

```javascript
using("enjoy::valid", "enjoy::validator", "enjoy::t_string", "enjoy::t_integer").
run(function (valid, validator, t_string, t_integer) {
    
    var personSchema = {
        type: "person",
        firstName: t_string,
        lastName: t_string,
        age: t_integer 
    };
    
    var validJames = {
        type: "person",
        firstName: "James",
        lastName: "Doe",
        age: 42,
        occupation: "Programmer"
    };
    
    var invalidJames = {
        type: "person",
        firstName: 23,
        lastName: "Doe",
        age: "42"
    };
    
    var isPerson = validator(personSchema);
    
    valid(validJames, personSchema); // true
    valid(invalidJames, personSchema); // false
    isPerson(validJames); // true
    isPerson(invalidJames); // false
    
});
```

