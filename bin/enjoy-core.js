/* global using, define, window, module */

(function () {
    
    var out = {
        hidden_properties: []
    };
    
        
    function is_null (a) {
        return a === null;
    }
    
    function is_undefined (a) {
        return typeof a === "undefined";
    }
    
    function is_boolean (a) {
        return typeof a === "boolean";
    }
    
    function is_number (a) {
        return typeof a === "number";
    }
    
    function is_string (a) {
        return typeof a === "string";
    }
    
    function is_char (a) {
        return is_string(a) && a.length === 1;
    }
    
    function is_collection (a) {
        return is_object(a) || is_array(a);
    }
    
    function is_object (a) {
        return typeof a === "object" && a !== null;
    }
    
    function is_array (a) {
        return Array.isArray(a);
    }
    
    function is_function (a) {
        return typeof a === "function";
    }
    
    function is_primitive (a) {
        return is_null(a) || is_undefined(a) || is_number(a) || is_string(a) || is_boolean(a);
    }
    
    function is_type (a) {
        return is_object(a) && a.$__type__ === "type";
    }
    
    function valid (data, schema) {
        
        var key;
        
        if (!is_object(data)) {
            
            if (is_type(schema)) {
                return is_a(data, schema);
            }
            
            if (is_function(schema)) {
                return schema(data);
            }
            
            return identical(data, schema);
        }
        else {
            
            for (key in schema) {
                
                if (is_type(schema[key])) {
                    
                    if (!is_a(data[key], schema[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (is_function(schema[key])) {
                    
                    if (!schema[key](data[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (is_object(schema[key])) {
                    
                    if (!valid(data[key], schema[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (!equal(schema[key], data[key])) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    function validator (schema) {
        return partial(valid, undefined, schema);
    }
    
    function type (checker) {
        
        var obj = Object.create(null);
        
        if (!arguments.length) {
            checker = function () { return false; };
        }
        
        if (!is_function(checker)) {
            checker = validator(checker);
        }
        
        Object.defineProperty(obj, "$__type__", {value: "type"});
        Object.defineProperty(obj, "toString", {value: function () { return "[object Type]"; }});
        Object.defineProperty(obj, "$__children__", {value: []});
        Object.defineProperty(obj, "$__checker__", {value: checker});
        
        Object.freeze(obj);
        
        return obj;
    }
    
    function derive (child, parent) {
        
        if (!is_type(child)) {
            throw new TypeError("Child is not a type in call to derive(child, parent).");
        }
        
        if (!is_type(parent)) {
            throw new TypeError("Parent is not a type in call to derive(child, parent).");
        }
        
        if (descendant_of(child, parent)) {
            throw new Error("Child is already a descendent of this parent.");
        }
        
        parent.$__children__.push(child);
    }
    
    function descendant_of (a, b) {
        
        if (!is_type(a)) {
            throw new TypeError("Parameter 'a' must be a type.");
        }
        
        if (!is_type(b)) {
            throw new TypeError("Parameter 'b' must be a type.");
        }
        
        return some(b.$__children__, function (c) {
            return (c === a ? true : some(c.$__children__, bind(descendant_of, a)));
        });
    }
    
    function is_a (a, t) {
        
        if (!is_type(t)) {
            
            if (typeof t !== "function") {
                return false;
            }
            
            return a instanceof t;
        }
        
        if (is_type(a) && descendant_of(a, t)) {
            return true;
        }
        
        if (t.$__checker__(a)) {
            return true;
        }
        
        return some(t.$__children__, function (child) {
            return is_a(a, child);
        });
    }
    
    var t_primitive = type(is_primitive);
    var t_composite = type(is_object);
    
    var t_null = type(is_null);
    var t_undefined = type(is_undefined);
    
    var t_boolean = type(is_boolean);
    
    var t_char = type(is_char);
    var t_string = type(is_string);
    
    var t_number = type(is_number);
    var t_float = type(function (n) { return is_number(n) && n % 1 !== 0; });
    var t_integer = type(function (n) { return is_number(n) && n % 1 === 0; });
    
    var t_object = type(is_object);
    var t_array = type(is_array);
    
    var t_function = type(is_function);
    
    derive(t_null, t_primitive);
    derive(t_undefined, t_primitive);
    derive(t_boolean, t_primitive);
    derive(t_string, t_primitive);
    
    derive(t_char, t_string);
    
    derive(t_float, t_number);
    derive(t_integer, t_number);
    
    derive(t_object, t_composite);
    derive(t_array, t_object);
    derive(t_function, t_object);
    
    Object.defineProperty(out, "type", {value: type});
    Object.defineProperty(out, "derive", {value: derive});
    Object.defineProperty(out, "valid", {value: valid});
    Object.defineProperty(out, "validator", {value: validator});
    
    Object.defineProperty(out, "is_a", {value: is_a});
    Object.defineProperty(out, "is_null", {value: is_null});
    Object.defineProperty(out, "is_undefined", {value: is_undefined});
    Object.defineProperty(out, "is_boolean", {value: is_boolean});
    Object.defineProperty(out, "is_number", {value: is_number});
    Object.defineProperty(out, "is_string", {value: is_string});
    Object.defineProperty(out, "is_char", {value: is_char});
    Object.defineProperty(out, "is_colllection", {value: is_collection});
    Object.defineProperty(out, "is_object", {value: is_object});
    Object.defineProperty(out, "is_array", {value: is_array});
    Object.defineProperty(out, "is_function", {value: is_function});
    Object.defineProperty(out, "is_primitive", {value: is_primitive});
    Object.defineProperty(out, "is_type", {value: is_type});
    
    Object.defineProperty(out, "t_primitive", {value: t_primitive});
    Object.defineProperty(out, "t_composite", {value: t_composite});
    Object.defineProperty(out, "t_null", {value: t_null});
    Object.defineProperty(out, "t_undefined", {value: t_undefined});
    Object.defineProperty(out, "t_boolean", {value: t_boolean});
    Object.defineProperty(out, "t_char", {value: t_char});
    Object.defineProperty(out, "t_string", {value: t_string});
    Object.defineProperty(out, "t_number", {value: t_number});
    Object.defineProperty(out, "t_float", {value: t_float});
    Object.defineProperty(out, "t_integer", {value: t_integer});
    Object.defineProperty(out, "t_object", {value: t_object});
    Object.defineProperty(out, "t_array", {value: t_array});
    Object.defineProperty(out, "t_function", {value: t_function});
    
    out.hidden_properties.push("$__type__");
    out.hidden_properties.push("$__children__");
    out.hidden_properties.push("$__checker__");
        
    function contains (collection, item) {
        return some(collection, function (currentItem) {
            return item === currentItem;
        }) || false;
    }
    
    out.contains = contains;
    

//
// Turns an array of objects into an object where the keys are the
// values of a property of the objects contained wihtin the original array.
//
// Example:
//
//     [{name: "foo"},{name: "bar"}] => {foo: {name: "foo"}, bar: {name: "bar"}}
//

    
    function expose (collection, key) {
        
        var result = {};
        
        each(collection, function (item) {
            result[item[key]] = item;
        });
        
        return result;
    }
    
    out.expose = expose;
    
    
    function filter (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            if (fn(item, key, collection)) {
                items.push(item);
            }
        });
        
        return items;
    }
    
    out.filter = filter;
        
    function find (collection, fn) {
        
        var value;
        
        some(collection, function (item, key) {
            
            if (fn(item, key, collection)) {
                value = item;
                return true;
            }
            
            return false;
        });
        
        return value;
    }
    
    out.find = find;
    
    
    function has (collection, key) {
        return some(collection, function (item, currentKey) {
            return key === currentKey;
        }) || false;
    }
    
    out.has = has;
    
    
    function head (iterable) {
        return iterable[0];
    }
    
    out.head = head;
    
    
    function keys (collection) {
        return map(collection, function (item, key) {
            return key;
        });
    }
    
    out.keys = keys;
    
    
    function map (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            items.push(fn(item, key, collection));
        });
        
        return items;
    }
    
    out.map = map;
    
    
    function pluck (collection, key) {
        
        var result = [];
        
        map(collection, function (item) {
            if (key in item) {
                result.push(item[key]);
            }
        });
        
        return result;
    }
    
    out.pluck = pluck
    

//
// Turns an object into an array by putting its keys into the objects
// contained within the array.
//
// Example:
//
//     {foo: {}, bar: {}} => [{name: "foo"},{name: "bar"}]
//

    
    function privatize (collection, key) {
        
        var result = [];
        
        each(collection, function (item, currentKey) {
            
            item[key] = currentKey;
            
            result.push(item);
        });
        
        return result;
    }
    
    out.privatize = privatize;
    
    
    function reduce (collection, fn, value) {
        
        each(collection, function (item, key) {
            value = fn(value, item, key, collection);
        });
        
        return value;
    }
    
    out.reduce = reduce;
    
    
    function tail (iterable) {
        return iterable.slice(1);
    }
    
    out.tail = tail;
    
    
    function take (obj, key) {
        return obj[key];
    }
    
    out.take = take;
    
    
    function taker (key) {
        return partial(take, undefined, key);
    }
    
    out.taker = taker;
    
    
    function values (collection) {
        return map(collection, function (item) {
            return item;
        });
    }
    
    out.values = values;
        
    function identical (a, b) {
        return a === b;
    }
    
    function equal (a, b) {
        
        var key, index, isArray, isArgumentsObject;
        
        if (a === b) {
            return true;
        }
        
        if (typeof a !== typeof b) {
            return false;
        }
        
        if (a === null && b !== null) {
            return false;
        }
        
        isArray = Array.isArray(a);
        isArgumentsObject = typeof a === "object" && a.toString() === "[object Arguments]";
        
        if (isArray || isArgumentsObject) {
            
            if (isArray && !Array.isArray(b)) {
                return false;
            }
            
            if (isArgumentsObject && b.toString() !== "[object Arguments]") {
                return false;
            }
            
            if (a.length !== b.length) {
                return false;
            }
            
            for (index = 0; index < a.length; index += 1) {
                if (!equal(a[index], b[index])) {
                    return false;
                }
            }
            
            return true;
        }
        
        if (typeof a === "object") {
            
            if (a.prototype !== b.prototype) {
                return false;
            }
            
            for (key in a) {
                if (!equal(a[key], b[key])) {
                    return false;
                }
            }
            
            for (key in b) {
                if (!equal(a[key], b[key])) {
                    return false;
                }
            }
            
            if (some(out.hidden_properties, function (key) { return a[key] !== b[key]; })) {
                return false;
            }
            
            return true;
        }
        
        return false;
    }
    
    out.equal = equal;
    
    
    function apply (fn, args) {
        
        if (typeof fn !== "function") {
            throw new TypeError("Argument 'fn' must be a function.");
        }
        
        return fn.apply(undefined, args);
    }
    
    out.apply = apply;
    
    function bind (fn) {
        
        var args = [].slice.call(arguments);
        
        args.shift();
        
        return function () {
            
            var allArgs = args.slice(), i;
            
            for (i = 0; i < arguments.length; i += 1) {
                allArgs.push(arguments[i]);
            }
            
            fn.apply(undefined, allArgs);
        };
    }
    
    out.bind = bind;
    
    function call (fn) {
        
        var args = [].slice.call(arguments);
        
        args.shift();
        
        return fn.apply(undefined, args);
    }
    
    out.call = call;
    
    function partial (fn) {
        
        var args = [].slice.call(arguments, 1);
        
        return function () {
            
            var callArgs = [].slice.call(arguments);
            
            var allArgs = args.map(function (arg, index) {
                
                if (typeof arg === "undefined") {
                    return callArgs.shift();
                }
                
                return arg;
            });
            
            if (callArgs.length) {
                callArgs.forEach(function (arg) {
                    allArgs.push(arg);
                });
            }
            
            return apply(fn, allArgs);
        };
    }
    
    out.partial = partial;
    
    function pipe (value) {
        
        each(arguments, function (fn, index) {
            if (index > 0) {
                value = fn(value);
            }
        });
        
        return value;
    }
    
    out.pipe = pipe;
    
    function piped () {
        
        var functions = [].slice.call(arguments);
        
        return function (value) {
            
            var args = functions.slice();
            
            args.unshift(value);
            
            return apply(pipe, args);
        };
    };
    
    out.piped = piped;
        
    function each (collection, fn) {
        
        if (Array.isArray(collection)) {
            return collection.forEach(fn);
        }
        
        if (typeof collection.length === "number" && collection.length > 0) {
            return eachIterable(collection, fn);
        }
        
        return eachObject(collection, fn);
    }
    
    out.each = each;
    
    function eachIterable (collection, fn) {
        for (var index = 0; index < collection.length; index += 1) {
            fn(collection[index], index, collection);
        }
    }
    
    function eachObject (collection, fn) {
        for (var key in collection) {
            fn(collection[key], key, collection);
        }
    }
    
    
    function every (collection, fn) {
        
        var result = true;
        
        some(collection, function (item, key) {
            
            if (!fn(item, key, collection)) {
                result = false;
                return true;
            }
            
            return false;
        });
        
        return result;
    }
    
    out.every = every;
    
    
    function some (collection, fn) {
        return Array.isArray(collection) ? someArray(collection, fn) : someObject(collection, fn);
    }
    
    out.some = some;
    
    function someArray (collection, fn) {
        
        var index, length, value;
        
        for (index = 0, length = collection.length; index < length; index += 1) {
            
            value = fn(collection[index], index, collection);
            
            if (value) {
                return true;
            }
        }
        
        return false;
    }
    
    function someObject (collection, fn) {
        
        var key, value;
        
        for (key in collection) {
            
            value = fn(collection[key], key, collection);
            
            if (value) {
                return true;
            }
        }
        
        return false;
    }
    
    
    var METHOD_PRECEDENCE_SCORE_FN = 10;
    var METHOD_PRECEDENCE_SCORE_ID = 8;
    var METHOD_PRECEDENCE_SCORE_EQ = 6;
    var METHOD_PRECEDENCE_SCORE_IS_A = 4;
    
    function method (defaultFn) {
        
        var dispatchers = [].slice.call(arguments, 1);
        
        function fn () {
            
            var argsLength = arguments.length;
            var implementation = fn.$__default__;
            var highestScore = 0;
            
            var dispatchValues = map(arguments, function (arg, i) {
                
                var dispatcher = fn.$__dispatchers__[i] || id;
                
                //console.log(dispatcher);
                
                return call(dispatcher, arg);
            });
            
            //console.log("dispatchValues:", dispatchValues);
            
            some(fn.$__implementations__, function (impl) {
                
                var currentScore = 0;
                var predicateMatches = 0;
                
                if (argsLength < impl.$__comparators__.length) {
                    return false;
                }
                
                var match = every(dispatchValues, function (dispatchValue, i) {
                    
                    var comparator = impl.$__comparators__[i];
                    var comparatorIsFunction = typeof comparator === "function";
                    var argumentOrderModificator = dispatchValues.length - i;
                    
                    if (comparatorIsFunction && comparator(dispatchValue)) {
                        predicateMatches += 1;
                        currentScore += METHOD_PRECEDENCE_SCORE_FN * argumentOrderModificator;
                        return true;
                    }
                    
                    if (identical(dispatchValue, comparator)) {
                        currentScore += METHOD_PRECEDENCE_SCORE_ID * argumentOrderModificator;
                        return true;
                    }
                    
                    if (equal(dispatchValue, comparator)) {
                        currentScore += METHOD_PRECEDENCE_SCORE_EQ * argumentOrderModificator;
                        return true;
                    }
                    
                    if (is_a(dispatchValue, comparator)) {
                        currentScore += METHOD_PRECEDENCE_SCORE_IS_A * argumentOrderModificator;
                        return true;
                    }
                    
                    return false;
                });
                
                if (currentScore > highestScore) {
                    highestScore = currentScore;
                    implementation = impl.$__implementation__;
                }
                
                //console.log("currentScore:", currentScore);
                
                if (predicateMatches > 0 && predicateMatches === dispatchValues.length) {
                    //console.log("Found full predicate match. Stopping implementation search.");
                    return true;
                }
                
                return false;
            });
            
            return apply(implementation, arguments);
        }
        
        if (defaultFn && typeof defaultFn !== "function") {
            throw new TypeError("Argument 1 must be a function.");
        }
        
        Object.defineProperty(fn, "$__default__", {
            value: defaultFn || function () {
                throw new TypeError("No matching implementation found for method arguments.");
            },
            writable: true
        });
        
        Object.defineProperty(fn, "$__dispatchers__", {
            value: [],
            writable: true
        });
        
        Object.defineProperty(fn, "$__implementations__", {
            value: [],
            writable: true
        });
        
        dispatchers.unshift(fn);
        
        apply(dispatch, dispatchers);
        
        return fn;
    }
    
    out.method = method;
    
    function dispatch (method) {
        
        var dispatchers = [].slice.call(arguments, 1);
        
        each(dispatchers, function (dispatcher, index) {
            
            var dtype = typeof dispatcher;
            
            console.log("dispatcher:", dtype, dispatcher);
            
            if (dtype !== "function" && (dtype === "string" || dtype === "number")) {
                dispatcher = partial(pluck, undefined, dispatcher);
            }
            else if (dtype !== "function") {
                throw new TypeError("Dispatchers must be strings, numbers or functions.");
            }
            
            dispatchers[index] = dispatcher;
        });
        
        method.$__dispatchers__ = dispatchers;
    }
    
    out.dispatch = dispatch;
        
    function specialize () {
        
        var args = [].slice.call(arguments);
        var method = args.shift();
        var implementation = args.pop();
        var comparators = args.slice();
        var specialization;
        
        var old = find(
            method.$__implementations__,
            function (impl) {
                return every(impl.$__comparators__, function (comp, i) {
                    return equal(comp, comparators[i]);
                });
            }
        );
        
        if (old) {
            old.$__implementation__ = implementation;
        }
        else {
            
            specialization = {};
            
            Object.defineProperty(specialization, "$__comparators__", {
                value: comparators
            });
            
            Object.defineProperty(specialization, "$__implementation__", {
                value: implementation,
                writable: true
            });
            
            method.$__implementations__.push(specialization);
        }
    }
    
    out.hidden_properties.push("$__comparators__");
    out.hidden_properties.push("$__default__");
    out.hidden_properties.push("$__dispatchers__");
    out.hidden_properties.push("$__implementation__");
    out.hidden_properties.push("$__implementations__");
    
    out.specialize = specialize;
        
    function id (thing) {
        return thing;
    }
    
    out.id = id;
    

    
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

